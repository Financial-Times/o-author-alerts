'use strict';

var jsonp = require('./lib/jsonp');
var _ = require('lodash');
var BrowserStore = require('./lib/BrowserStore');
var event = require('./lib/event');
var storage = new BrowserStore(localStorage);


function Following(userId) {
	this.userId = userId;
	this.entities = {};
	this.serverFetched = {};
}

Following.prototype.set = function(data) {
	if(data.status === 'success' && data.taxonomies.length) {
		if(this.pendingDiff().length) {
			//we still have pending requests, so pretend the cached ones are most up to date
			//while we do a an update in the background
			this.entities = _.cloneDeep(this.pending.client);
			this.serverFetched =  _.indexBy(data.taxonomies, 'id');
			this.savePending();
		} else {
			this.entities = _.indexBy(data.taxonomies, 'id');
			this.serverFetched = _.cloneDeep(this.entities);
			this.clearPending();
		}
	} else {
			this.savePending();
	}
	event.dispatch('oFollow.userPreferencesLoaded', this.entities);
}

Following.prototype.get = function() {
	var self = this;
	this.pending = JSON.parse(storage.get('oFollowUserCache-' + this.userId));
	if(this.pendingDiff().length) {
		this.sync();
	} else {
		var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=' + this.userId;
		jsonp.get(url, 'oFollowGetCallback', function(data) {
			self.set(data);
		});
	}
}

Following.prototype.pendingDiff = function() {
	if(this.pending) {
		return _.xor(_.keys(this.pending.client), _.keys(this.pending.server));
	}
	return [];
}

Following.prototype.sync = function() {
	var self = this;
	var id;
	var difference = this.pendingDiff();
	if(difference.length === 0 || self.pending.tried > 2) {
		this.clearPending();
	} else {
		self.pending.tried = self.pending.tried + 1;
		difference.forEach(function(id) {
			if(self.pending.client.hasOwnProperty(id)) {
				self.start(self.pending.client[id]);
			} else if (self.pending.server.hasOwnProperty(id)) {
				self.stop(self.pending.server[id]);
			}
		})
	};

};

Following.prototype.addEntity = function(entity) {
	this.entities[entity.id] = entity;
}
Following.prototype.removeEntity = function(entity) {
	delete this.entities[entity.id];
}

Following.prototype.savePending = function() {
	if(this.entities && Object.keys(this.entities).length) {
		var obj = {
			tried: 0,
			client: this.entities,
			server: this.serverFetched
		}
		storage.put('oFollowUserCache-'+this.userId, JSON.stringify(obj));
	}
}
Following.prototype.clearPending = function() {
	storage.delete('oFollowUserCache-'+this.userId);
	this.pending = null;
}

Following.prototype.start = function(entity) {
	if(!(this.userId && entity.id && entity.name)) return;
	var self = this;
	var url = 'http://personalisation.ft.com/follow/update?userId=' + 
			this.userId + '&type=authors&name=' +
			entity.name + '&id=' +
			entity.id;
	this.addEntity(entity);
	jsonp.get(url, 'oFollowStartCallback', function(data) {
		self.set(data);
	});
}

Following.prototype.stop = function(entity) {
	if(!(this.userId && entity.id && entity.name)) return;
	var self = this;
	var url = 'http://personalisation.ft.com/follow/stopFollowing?userId=' + 
			this.userId + '&type=authors&id='+
			entity.id;
	this.removeEntity(entity);
	jsonp.get(url, 'oFollowStopCallback', function(data) {
		self.set(data);
	});
};



module.exports = Following;