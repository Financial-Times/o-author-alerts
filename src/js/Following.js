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

Following.prototype.set = function(data, entity, action) {
	if(data.status === 'success' && data.taxonomies) {
		this.online = true;
		this.entities = data.taxonomies;
		if(entity) {
			this.removeFromPending(entity);
			eventHelper.dispatch('oFollow.updateSave', {
				data: data,
				entity: entity,
				action: action,
				userId: this.userId
			});
		} else {
			this.sync();
			eventHelper.dispatch('oFollow.userPreferencesLoad', this.entities);
		}
	} else {
		eventHelper.dispatch('oFollow.serverError', {
			data: data,
			entity: entity,
			action: action,
			userId: this.userId
		});
		if(entity && isRetryable(data)) {
			this.online = false;
			this.addToPending(entity, action);
		}

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


Following.prototype.get = function() {
	var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=' + this.userId;
	jsonp.get(url, 'oFollowGetCallback', this.set.bind(this));
};

Following.prototype.sync = function() {
	var newEntities = [],
			id,
			pending;

	//G through pending
	for(id in this.pending) {
		if(this.pending.hasOwnProperty(id)) {
			pending = this.pending[id];
			pending.tried += 1;
			//Get rid of any that have maxed out attemptes
			if(pending.tried > MAX_ATTEMPTS) {
				this.removeFromPending(pending.entity);
				continue;
			}

			//start/stop
			if(pending.action === 'start') {
				//if its a new one, add it to the list we have gotten from the server
				newEntities.push(pending.entity);
				this.start(pending.entity);
			} else {
				this.stop(pending.entity);
			}
		}
	}

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
		this.addToPending(entity, 'stop');
	}

};



module.exports = Following;