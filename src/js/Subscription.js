'use strict';

var jsonp = require('./lib/jsonp'),
		eventHelper = require('./lib/eventHelper'),
		BrowserStore = require('./lib/BrowserStore'),
		storage = new BrowserStore(localStorage),
		config = require('./config.js'),
		MAX_ATTEMPTS = 5,
		VALID_FREQUENCIES = ['off', 'daily', 'immediate', 'weekly'];


/*
	Subscription model attached to a user

	Handles fetching and updating the initial personalisation data.

	Also syncs to local storage when there is a failure in communication (e.g. Invalid session)
*/
function Subscription(userId) {
	this.userId = userId;
	this.entities = null;
	this.pending = JSON.parse(storage.get('oAuthorAlertsUserCache-'+this.userId)) || {};
	this.online = true;
}


Subscription.prototype = {

	/* Fetch the initial list of authors that a user is following */
	get: function() {
		var url = config.getFollowingUrl + '?userId=' + this.userId;
		jsonp.get(url, 'oAuthorAlertsGetCallback', this.set.bind(this));
	},

	/* Handle response from the personalisation server, for updates and fetches*/
	set: function(data, entity, frequency) {
		var eventToTrigger = '';

		if(data.status === 'success' && data.taxonomies) {
			eventToTrigger = 'updateSave';
			this.online = true;
			this.entities = data.taxonomies;

			if(entity) { // Update call
				this.removeFromPending(entity);
			} else { // Initial call to get user preferences
				this.sync();
				eventHelper.dispatch('oAuthorAlerts.userPreferencesLoad', this.entities);
			}
		} else {
			eventToTrigger = 'serverError';
			if(entity && isRetryable(data)) {
				//Likely to be an invalid session, so save off further requests to try later
				this.online = false;
				this.addToPending(entity, frequency);
			}
		}

		//TODO: use this tho display error messages within the module
		eventHelper.dispatch('oAuthorAlerts.' + eventToTrigger, {
			data: data,
			entity: entity,
			update: frequency,
			userId: this.userId
		});

	},

	/* Update the user preferences for a given entity, and frequency to update to*/
	update: function(entity, frequency) {
		var url,
				self = this;

		if(!(this.userId && entity.id && entity.name)){
			return;
		}

		//Default frequency is daily
		if(!frequency || VALID_FREQUENCIES.indexOf(frequency) < 0) {
			frequency = 'daily';
		}

		url = resolveUrl(entity, frequency, this.userId);

		//If user is unsubscribing all, then all pending requests become irrelevant
		if(entity.id === 'ALL') {
			this.clearPending();
		}

		if(this.online) {
			jsonp.get(url, 'oAuthorAlertsUpdateCallback', function (data) {
				self.set( data, entity, frequency);
			});
		} else {
			//don't execute jsonp call, but save it to do on another page visit
			this.addToPending(entity, frequency);
		}
	},

	/*

	Keep the list that we got back from the server in sync with any leftover requests from previous visits.
	This ensures that the view that a user see's is in line with what they think they have done,
	whilst we proceed to retry their request in the background.
	*/
	sync: function() {
		var newEntities = [],
				id,
				pending;

		//Go through pending requests from previous page visits
		for(id in this.pending) {
			if(this.pending.hasOwnProperty(id)) {
				pending = this.pending[id];
				pending.tried += 1;
				//Give up on any that have maxed out attempts
				if(pending.tried > MAX_ATTEMPTS) {
					this.removeFromPending(pending.entity);
					continue;
				}
				//send update request
				this.update(pending.entity, pending.update);
				// pending.entity.frequency = pending.update;
				if(pending.update !== 'off') {
					newEntities.push(pending.entity);
				}
			}
		}
		//ensure that the list we work with (of entities taht are being followed)
		// a) Includes he properly synced entities from the server
		// b) Includes the entities they want to follow, but havent been synced yet
		// c) Excludes the entities they want to stop following, but havent been synced
		this.entities = newEntities.concat(anythingThatIsntDueToStop(this.entities, this.pending));
	},

	// If we think we are cannot connect to server, add update calls to localStorage
	addToPending: function(entity, updateFrequency) {
		if(this.pending[entity.id] ) {
			if(this.pending[entity.id].update !== updateFrequency) {
				this.removeFromPending(entity);
			}
		} else {
			this.pending[entity.id] = {
				tried: 1,
				update: updateFrequency,
				entity: entity
			};
		}

		this.savePending();
	},

	removeFromPending: function(entity) {
		if(this.pending[entity.id]) {
			delete this.pending[entity.id];
		}
		this.savePending();
	},

	savePending: function() {
		if(this.pending && Object.keys(this.pending).length) {
			storage.put('oAuthorAlertsUserCache-'+this.userId, JSON.stringify(this.pending));
		} else {
			//get rid of the key from localstorage
			this.clearPending();
		}
	},

	clearPending: function() {
		storage.remove('oAuthorAlertsUserCache-' + this.userId);
	}
};



function isRetryable(data) {
  //these alerts occur if the user trys to stop alerts for something it has already stopped
  //i.e. in a different tab. In this case, no need to retry
  if(data.message && (data.message === 'user is not following this id' ||
    data.message === 'user has no following list')) {
    return false;
  }
  return true;
}

//
function anythingThatIsntDueToStop(entities, pending) {
	var newEntities = [],
			subscribedEntity,
			i, l;

	for(i=0,l=entities.length; i < l; i++) {
		subscribedEntity = entities[i];
		if(pending[subscribedEntity.id]) {
			if(pending[subscribedEntity.id].update !== 'off') {
				newEntities.push(subscribedEntity);
			}
		} else {
			newEntities.push(subscribedEntity);
		}
	}
	return newEntities;
}

// Return the correct URL to use based on the action they are taking.
function resolveUrl(entity, frequency, userId) {
	var url = '';
	if(entity.id === 'ALL') {
		url = config.stopAllUrl +
			'?userId=' + userId +
			'&type=authors';
	} else {
		url = (frequency === 'off' ? config.stopAlertsUrl : config.startAlertsUrl) +
			'?userId=' + userId +
			'&type=authors&name=' + entity.name +
			'&id=' + entity.id;

		if(frequency !== 'off') {
			url = url + '&frequency=' + frequency;
		}
	}
	return url;
}


module.exports = Subscription;