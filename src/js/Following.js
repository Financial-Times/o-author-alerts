'use strict';

var jsonp = require('./lib/jsonp');
var BrowserStore = require('./lib/BrowserStore');
var eventHelper = require('./lib/eventHelper');
var storage = new BrowserStore(localStorage);

var MAX_ATTEMPTS = 3;

function Following(userId) {
	this.userId = userId;
	this.entities = [];
	this.pending = JSON.parse(storage.get('oFollowUserCache-'+this.userId)) || {};
	this.online = true;
}

Following.prototype.set = function(data, entity, action) {
	if(data.status === 'success' && data.taxonomies) {
		this.online = true;
		this.entities = data.taxonomies;
		if(entity) {
			this.removeFromPending(entity);
		} else {
			this.sync();
			eventHelper.dispatch('oFollow.ready', this.entities);
		}
		// }
	} else {
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
	var self = this;
	var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=' + this.userId;
	jsonp.get(url, 'oFollowGetCallback', function(data) {
		self.set(data);
	});
};

Following.prototype.sync = function() {
	var self = this;
	var newEntities = [];

	//GO through pending
	for(var id in this.pending) {
		if(this.pending.hasOwnProperty(id)) {
			this.pending[id].tried += 1;
			//Get rid of any that have maxed out attemptes
			if(this.pending[id].tried > MAX_ATTEMPTS) {
				this.removeFromPending(this.pending[id].entity);
				continue;
			}
			//start/stop
			if(this.pending[id].action === 'start') {
				//if its a new one, add it to the list we have gotten from the server
				newEntities.push(this.pending[id].entity);
				this.start(this.pending[id].entity);
			} else {
				this.stop(this.pending[id].entity);
			}
		}
	}

	//go through the stuff from the server, and only keep it if we haven't told it to stop
	this.entities.forEach(function(followingEntity) {
		if(self.pending[followingEntity.id]) {
			if(self.pending[followingEntity.id].action !== 'stop') {
				newEntities.push(followingEntity);
			}
		} else {
			newEntities.push(followingEntity);
		}
	});

	this.entities = newEntities;
};

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
	storage.delete('oFollowUserCache-'+this.userId);
};

Following.prototype.start = function(entity) {
	if(!(this.userId && entity.id && entity.name)){
		return;
	}
	var self = this;
	var url = 'http://personalisation.ft.com/follow/update?userId=' + 
			this.userId + '&type=authors&name=' +
			entity.name + '&id=' +
			entity.id;
	//TODO - move this to a method?
	if(this.online) {
		jsonp.get(url, 'oFollowStartCallback', function(data) {
			self.set(data, entity, 'start');
		});
	} else {
		this.addToPending(entity, 'start');
	}
};

Following.prototype.stop = function(entity) {
	if(!(this.userId && entity.id && entity.name)) {
		return;
	} 
	var self = this;
	var url = 'http://personalisation.ft.com/follow/stopFollowing?userId=' + 
			this.userId + '&type=authors&id='+
			entity.id;

	if(this.online) {
		jsonp.get(url, 'oFollowStopCallback', function(data) {
			self.set(data, entity, 'stop');
		});
	} else {
		this.addToPending(entity, 'stop');
	}
};



module.exports = Following;