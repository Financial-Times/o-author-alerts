'use strict';

var jsonp = require('./lib/jsonp'),
		eventHelper = require('./lib/eventHelper'),
		BrowserStore = require('./lib/BrowserStore'),
		storage = new BrowserStore(localStorage),
		MAX_ATTEMPTS = 3;

function Following(userId) {
	this.userId = userId;
	this.entities = null;
	this.pending = JSON.parse(storage.get('oFollowUserCache-'+this.userId)) || {};
	this.online = true;
}


Following.prototype.get = function() {
	var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=' + this.userId;
	jsonp.get(url, 'oFollowGetCallback', this.set.bind(this));
};


Following.prototype.set = function(data, entity, action) {
	var eventToTrigger = '';

	if(data.status === 'success' && data.taxonomies) {
		eventToTrigger = 'updateSave';
		this.online = true;
		this.entities = data.taxonomies;

		if(entity) { // Update call
			this.removeFromPending(entity);
		} else { // Initial call to get user preferences
			this.sync();
			eventHelper.dispatch('oFollow.userPreferencesLoad', this.entities);
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
	eventHelper.dispatch('oFollow.' + eventToTrigger, {
		data: data,
		entity: entity,
		action: action,
		userId: this.userId
	});

  eventHelper.dispatch(
  	'oTracking.Event', 
  	{ model: 'oFollow', 
  		type: eventToTrigger, 
  		value: 'entityId=' + (entity ? entity.id : '') + ',action=' + (action || '') }, 
  	window
	);

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


Following.prototype.sync = function() {
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
			followingEntity,
			i, l;

	for(i=0,l=entities.length; i < l; i++) {
		followingEntity = entities[i]; 
		if(pending[followingEntity.id]) {
			if(pending[followingEntity.id].action !== 'stop') {
				newEntities.push(followingEntity);
			}
		} else {
			newEntities.push(followingEntity);
		}
	}
	return newEntities;
}

Following.prototype.addToPending = function(entity, action) {
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

Following.prototype.removeFromPending = function(entity) {
	if(this.pending[entity.id]) {
		delete this.pending[entity.id];
	}
	this.savePending();
};

Following.prototype.savePending = function() {
	if(this.pending && Object.keys(this.pending).length) {
		storage.put('oFollowUserCache-'+this.userId, JSON.stringify(this.pending));
	} else {
		//get rid of the key from localstorage
		this.clearPending();
	}
};


Following.prototype.clearPending = function() {
	storage.delete('oFollowUserCache-' + this.userId);
};

Following.prototype.start = function(entity) {
	var url,
			self = this;

	if(!(this.userId && entity.id && entity.name)){
		return;
	}

	url = 'http://personalisation.ft.com/follow/update?userId=' + 
			this.userId + '&type=authors&name=' +
			entity.name + '&id=' +
			entity.id;

	if(this.online) {
		jsonp.get(url, 'oFollowStartCallback', function (data) {
			self.set( data, entity, 'start');
		});
	} else {
		//don't execute jsonp call, but save it to do on another page visit
		this.addToPending(entity, 'start');
	}
};

Following.prototype.stop = function(entity) {
	var url,
			self = this;
	if(!(this.userId && entity.id && entity.name)) {
		return;
	} 
	
	url = 'http://personalisation.ft.com/follow/stopFollowing?userId=' + 
			this.userId + '&type=authors&id='+
			entity.id;

	if(this.online) {
		jsonp.get(url, 'oFollowStopCallback', function (data) {
			self.set( data, entity, 'stop');
		});
	} else {
		//don't execute jsonp call, but save it to do on another page visit
		this.addToPending(entity, 'stop');
	}

};



module.exports = Following;