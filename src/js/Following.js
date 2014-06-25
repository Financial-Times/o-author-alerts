'use strict';

var jsonp = require('./lib/jsonp');
var BrowserStore = require('./lib/BrowserStore');
var event = require('./lib/event');
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
		}
		event.dispatch('oFollow.userPreferencesLoaded', this.entities);
		// }
	} else {
		this.online = false;
		if(entity) {
			this.addToPending(entity, action);
		}
	}
}

Following.prototype.get = function() {
	var self = this;
	var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=' + this.userId;
	jsonp.get(url, 'oFollowGetCallback', function(data) {
		self.set(data);
	});
}

Following.prototype.sync = function() {
	var self = this;
	var newEntities = [];

	for(var id in this.pending) {
		if(this.pending.hasOwnProperty(id)) {
			this.pending[id].tried += 1;
			if(this.pending[id].tried > MAX_ATTEMPTS) {
				this.removeFromPending(this.pending[id].entity);
				break;
			}
			if(this.pending[id].action === 'start') {
				newEntities.push(this.pending[id].entity);
				this.start(this.pending[id].entity);
			} else {
				this.stop(this.pending[id].entity);
			}
		}


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
	}
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
		}
	}

	this.savePending();
}
Following.prototype.removeFromPending = function(entity) {
	if(this.pending[entity.id]) {
		delete this.pending[entity.id];
	}
	this.savePending();
}

Following.prototype.savePending = function() {
	if(this.pending && Object.keys(this.pending).length) {
		storage.put('oFollowUserCache-'+this.userId, JSON.stringify(this.pending));
	} else {
		this.clearPending();
	}
}


Following.prototype.clearPending = function() {
	storage.delete('oFollowUserCache-'+this.userId);
}

Following.prototype.start = function(entity) {
	if(!(this.userId && entity.id && entity.name)) return;
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

}

Following.prototype.stop = function(entity) {
	if(!(this.userId && entity.id && entity.name)) return;
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