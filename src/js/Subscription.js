'use strict';

var jsonp = require('./lib/jsonp'),
		eventHelper = require('./lib/eventHelper'),
		BrowserStore = require('./lib/BrowserStore'),
		storage = new BrowserStore(localStorage),
		config = require('./config.js'),
		MAX_ATTEMPTS = 5;

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


Subscription.prototype.set = function(data, entity, action) {
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
			this.addToPending(entity, action);
		}
	}

	//TODO: use this tho display error messages within the module
	eventHelper.dispatch('oAuthorAlerts.' + eventToTrigger, {
		data: data,
		entity: entity,
		action: action,
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

			//start/stop these pending requests
			if(pending.action === 'start') {
				//if its a new one, add it to the list we have gotten from the server
				//so the display can update assuming that the user is already following them
				newEntities.push(pending.entity);
				this.start(pending.entity);
			} else {
				this.stop(pending.entity);
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
			if(pending[subscribedEntity.id].action !== 'stop') {
				newEntities.push(subscribedEntity);
			}
		} else {
			newEntities.push(subscribedEntity);
		}
	}
	return newEntities;
}

Subscription.prototype.addToPending = function(entity, action) {
	if(this.pending[entity.id] ) {
		if(this.pending[entity.id].action !== action) {
			this.removeFromPending(entity);
		}
	} else {
		this.pending[entity.id] = {
			tried: 1,
			action: action,
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

Subscription.prototype.start = function(entity) {
	var url,
			self = this;

	if(!(this.userId && entity.id && entity.name)){
		return;
	}

	url = config.startAlertsUrl + '?userId=' +
			this.userId + '&type=authors&name=' +
			entity.name + '&id=' +
			entity.id;

	if(this.online) {
		jsonp.get(url, 'oAuthorAlertsStartCallback', function (data) {
			self.set( data, entity, 'start');
		});
	} else {
		//don't execute jsonp call, but save it to do on another page visit
		this.addToPending(entity, 'start');
	}
};

Subscription.prototype.stop = function(entity) {
	var url,
			self = this;
	if(!(this.userId && entity.id && entity.name)) {
		return;
	} 
	
	url = config.stopAlertsUrl + '?userId=' + 
			this.userId + '&type=authors&id='+
			entity.id;

	if(this.online) {
		jsonp.get(url, 'oAuthorAlertsStopCallback', function (data) {
			self.set( data, entity, 'stop');
		});
	} else {
		//don't execute jsonp call, but save it to do on another page visit
		this.addToPending(entity, 'stop');
	}

};

Subscription.prototype.unsubscribeAll = function() {
	var i, n;
	for(i=0,n=this.entities.length; i<n; i++) {
		this.stop(this.entities[i]);
	}
};



module.exports = Subscription;