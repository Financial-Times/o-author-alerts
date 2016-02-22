'use strict';

var executionQueue = require('./lib/executionQueue');
var jsonp = require('./lib/jsonp/jsonp');
var eventHelper = require('./lib/eventHelper');
var BrowserStore = require('./lib/BrowserStore');
var storage = new BrowserStore(localStorage);
var config = require('./config.js');
var MAX_ATTEMPTS = 5;
var VALID_FREQUENCIES = ['off', 'daily', 'immediate', 'weekly'];


/*
	Subscription model attached to a user

	Handles fetching and updating the initial personalisation data.

	Also syncs to local storage when there is a failure in communication (e.g. Invalid session)
*/
function Subscription(sessionId) {
	this.sessionId = sessionId;
	this.entities = null;
	this.pending = JSON.parse(storage.get('oAuthorAlertsUserCache-'+this.sessionId)) || {};
	this.online = true;
}


Subscription.prototype = {

	/* Fetch the initial list of authors that a user is following */
	get: function() {
		var self = this;

		executionQueue.add(function (done, sessionId) {
			jsonp({
				url: config.get().getFollowingUrl
			},
			function (err, data) {
				if (err) {
					self.set();
					done();
					return;
				}

				self.set(data);
				done();
			});
		}, self.sessionId);
	},

	/* Handle response from the personalisation server, for updates and fetches*/
	set: function(data, entities) {
		var eventToTrigger = '';
		var item;
		var i;

		if (data && data.status === 'success' && data.taxonomies) {
			eventToTrigger = 'updateSave';
			this.online = true;
			this.entities = data.taxonomies;

			var sync = false;
			if (entities) {
				for (i = 0; i < entities.length; i++) {
					item = entities[i];

					if (item.entity) { // Update call
						this.removeFromPending(item.entity);
					} else if (!item.pending) { // Initial call to get user preferences
						sync = true;
					}
				}
			} else {
				sync = true;
			}

			if (sync) {
				this.sync();
				eventHelper.dispatch('oAuthorAlerts.userPreferencesLoad', this.entities);
			}
		} else {
			eventToTrigger = 'serverError';
			if (entities) {
				for (i = 0; i < entities.length; i++) {
					item = entities[i];

					if (item.entity && isRetryable(data)) {
						//Likely to be an invalid session, so save off further requests to try later
						this.online = false;
						this.addToPending(item.entity, item.frequency);
					}
				}
			}
		}

		//TODO: use this tho display error messages within the module
		eventHelper.dispatch('oAuthorAlerts.' + eventToTrigger, {
			data: data,
			entities: entities,
			sessionId: this.sessionId
		});

	},

	/* Update the user preferences for a given entity, and frequency to update to*/
	update: function(entity, frequency) {
		var url;
		var self = this;

		if (!(this.sessionId && entity.id && entity.name)){
			return;
		}

		//Default frequency is daily
		if (!frequency || VALID_FREQUENCIES.indexOf(frequency) < 0) {
			frequency = 'daily';
		}

		url = resolveUrl(entity, frequency);

		var addRequestToQueue = function (url, entity, frequency) {
			executionQueue.add(function (done, url, entity, frequency) {
				if (self.online) {
					jsonp({
						url: url
					}, function (err, data) {
						if (err) {
							self.set(null, [{
								entity: entity,
								frequency: frequency
							}]);
							done();

							return;
						}

						self.set(data, [{
							entity: entity,
							frequency: frequency
						}]);
						done();
					});
				} else {
					self.addToPending(entity, frequency);

					done();
				}
			}, [url, entity, frequency]);
		};

		if (this.online) {
			addRequestToQueue(url, entity, frequency);
		} else {
			//don't execute jsonp call, but save it to do on another page visit
			this.addToPending(entity, frequency);
		}
	},

	updateBulk: function (entities) {
		var self = this;
		var i, j;
		var baseUrl = config.get().updateBulk;
		var chunk = 10;
		var item;

		if (!this.sessionId) {
			return;
		}


		var addRequestToQueue = function (url, arr) {
			executionQueue.add(function (done, url, arr) {
				if (self.online) {
					jsonp({
						url: url
					}, function (err, data) {
						if (err) {
							self.set(null, arr);
							done();

							return;
						}

						self.set(data, arr);
						done();
					});
				} else {
					for (j = 0; j < arr.length; j++) {
						item = arr[j];

						self.addToPending(item.entity, item.frequency);
					}

					done();
				}
			}, [url, arr]);
		};


		if (entities && entities instanceof Array) {
			var arr = [];
			var hasItems = false;
			var url = baseUrl;

			if (self.online) {
				for (i = 0; i < entities.length; i++) {
					item = entities[i];

					if (item.entity.id && item.entity.name) {
						if (item.entity.id === 'ALL') {
							// stop following all
							self.update({id: 'ALL', name: 'ALL'}, 'off');

							// drop updates before
							continue;
						} else {
							hasItems = true;
							arr.push(item);

							if (!item.frequency || VALID_FREQUENCIES.indexOf(item.frequency) < 0) {
								item.frequency = 'daily';
							}

							url += '&' +
									(item.frequency === 'off' ? 'unfollow' : 'follow') +
									'=' + (item.frequency !== 'off' ? item.frequency + ',' : '') + item.entity.name + ',' + item.entity.id;
						}
					}

					if (i > 0 && i % chunk === 0) {
						if (hasItems) {
							addRequestToQueue(url, arr);
						}

						arr = [];
						hasItems = false;
						url = baseUrl;
					}
				}

				if (arr.length) {
					addRequestToQueue(url, arr);
				}
			} else {
				//don't execute jsonp call, but save it to do on another page visit
				for (j = 0; j < entities.length; j++) {
					item = entities[j];

					self.addToPending(item.entity, item.frequency);
				}
			}
		}
	},

	/*

	Keep the list that we got back from the server in sync with any leftover requests from previous visits.
	This ensures that the view that a user see's is in line with what they think they have done,
	whilst we proceed to retry their request in the background.
	*/
	sync: function() {
		var newEntities = [];
		var id;
		var pending;
		var updates = [];

		//Go through pending requests from previous page visits
		for (id in this.pending) {
			if (this.pending.hasOwnProperty(id)) {
				pending = this.pending[id];
				pending.tried += 1;
				//Give up on any that have maxed out attempts
				if (pending.tried > MAX_ATTEMPTS) {
					this.removeFromPending(pending.entity);
					continue;
				}

				updates.push({
					entity: pending.entity,
					frequency: pending.frequency,
					pending: true
				});

				// pending.entity.frequency = pending.update;
				if (pending.frequency !== 'off') {
					newEntities.push(pending.entity);
				}
			}
		}

		if (updates.length) {
			this.updateBulk(updates);
		}

		//ensure that the list we work with (of entities taht are being followed)
		// a) Includes he properly synced entities from the server
		// b) Includes the entities they want to follow, but havent been synced yet
		// c) Excludes the entities they want to stop following, but havent been synced
		this.entities = newEntities.concat(anythingThatIsntDueToStop(this.entities, this.pending));
	},

	// If we think we are cannot connect to server, add update calls to localStorage
	addToPending: function(entity, updateFrequency) {
		if (this.pending[entity.id] ) {
			if (this.pending[entity.id].frequency !== updateFrequency) {
				this.removeFromPending(entity);
			}
		} else {
			this.pending[entity.id] = {
				tried: 1,
				frequency: updateFrequency,
				entity: entity
			};
		}

		this.savePending();
	},

	removeFromPending: function(entity) {
		if (this.pending[entity.id]) {
			delete this.pending[entity.id];
		}
		this.savePending();
	},

	savePending: function() {
		if (this.pending && Object.keys(this.pending).length) {
			storage.put('oAuthorAlertsUserCache-'+this.sessionId, JSON.stringify(this.pending));
		} else {
			//get rid of the key from localstorage
			this.clearPending();
		}
	},

	clearPending: function() {
		storage.remove('oAuthorAlertsUserCache-' + this.sessionId);
	}
};



function isRetryable(data) {
	//these alerts occur if the user trys to stop alerts for something it has already stopped
	//i.e. in a different tab. In this case, no need to retry
	if (data && data.message && (data.message === 'user is not following this id' ||
		data.message === 'user has no following list')) {
		return false;
	}
	return true;
}

//
function anythingThatIsntDueToStop(entities, pending) {
	var newEntities = [];
	var subscribedEntity;
	var i;
	var l;

	for (i=0,l=entities.length; i < l; i++) {
		subscribedEntity = entities[i];
		if (pending[subscribedEntity.id]) {
			if (pending[subscribedEntity.id].frequency !== 'off') {
				newEntities.push(subscribedEntity);
			}
		} else {
			newEntities.push(subscribedEntity);
		}
	}
	return newEntities;
}

// Return the correct URL to use based on the action they are taking.
function resolveUrl(entity, frequency) {
	var url = '';
	if (entity.id === 'ALL') {
		url = config.get().stopAllUrl
	} else {
		url = (frequency === 'off' ? config.get().stopAlertsUrl : config.get().startAlertsUrl) +
			'?name=' + entity.name +
			'&id=' + entity.id;

		if (frequency !== 'off') {
			url = url + '&frequency=' + frequency;
		}
	}
	return url;
}


module.exports = Subscription;
