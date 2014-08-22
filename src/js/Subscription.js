'use strict';

var jsonp = require('./lib/jsonp'),
		eventHelper = require('./lib/eventHelper'),
		BrowserStore = require('./lib/BrowserStore'),
		storage = new BrowserStore(localStorage),
		config = require('./config.js'),
		MAX_ATTEMPTS = 5,
		VALID_FREQUENCIES = ['off', 'daily', 'immediate', 'weekly'];

function Subscription(userId) {
	this.userId = userId;
	this.entities = null;
	this.pending = JSON.parse(storage.get('oAuthorAlertsUserCache-'+this.userId)) || {};
	this.online = true;
}


Subscription.prototype.get = function() {
	var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=' + this.userId;
	jsonp.get(url, 'oAuthorAlertsGetCallback', this.set.bind(this));
};


Subscription.prototype.set = function(data, entity, frequency) {
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


Subscription.prototype.sync = function() {
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
	//ensure that the list we work with
	// a) Includes he properly synced entities from the server
	// b) Includes the entities they want to follow, but havent been synced yet
	// c) Excludes the entities they want to stop following, but havent been synced
	this.entities = newEntities.concat(anythingThatIsntDueToStop(this.entities, this.pending));
};

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

Subscription.prototype.addToPending = function(entity, updateFrequency) {
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
};

Subscription.prototype.removeFromPending = function(entity) {
	if(this.pending[entity.id]) {
		delete this.pending[entity.id];
	}
	this.savePending();
};

Subscription.prototype.savePending = function() {
	if(this.pending && Object.keys(this.pending).length) {
		storage.put('oAuthorAlertsUserCache-'+this.userId, JSON.stringify(this.pending));
	} else {
		//get rid of the key from localstorage
		this.clearPending();
	}
};


Subscription.prototype.clearPending = function() {
	storage.remove('oAuthorAlertsUserCache-' + this.userId);
};



Subscription.prototype.update = function(entity, frequency) {
	var url,
			self = this;

	if(!(this.userId && entity.id && entity.name)){
		return;
	}

	if(!frequency || VALID_FREQUENCIES.indexOf(frequency) < 0) {
		frequency = 'daily';
	}

	url = (frequency === 'off' ? config.stopAlertsUrl : config.startAlertsUrl) + 
			'?userId=' + this.userId + 
			'&type=authors&name=' + entity.name + 
			'&id=' + entity.id;

	if(frequency !== 'off') {
		url = url + '&frequency=' + frequency;
	}
			

	if(this.online) {
		jsonp.get(url, 'oAuthorAlertsUpdateCallback', function (data) {
			self.set( data, entity, frequency);
		});
	} else {
		//don't execute jsonp call, but save it to do on another page visit
		this.addToPending(entity, frequency);
	}
};


Subscription.prototype.unsubscribeAll = function() {
	var i, n;
	for(i=0,n=this.entities.length; i<n; i++) {
		this.stop(this.entities[i]);
	}
};



module.exports = Subscription;