'use strict';

var jsonp = require('./lib/jsonp');
var _ = require('lodash');
var BrowserStore = require('./lib/BrowserStore');
var event = require('./lib/event');
var storage = new BrowserStore(localStorage);


function Following(userId) {
	this.userId = userId;
	this.entities = JSON.parse(storage.get('oFollowUserCache-' + this.userId)) || [];
	this.fromStorage = true;
}

Following.prototype.set = function(data) {
	if(data.status === 'success' && data.taxonomies) {
		var client = this.entities;
		var server = data.taxonomies;
		this.entities = server;
		if(this.fromStorage) {
			this.sync(client, server);
		}
		this.fromStorage = false;
		this.save();
	} else {
		this.save();
		this.fromStorage = true;
	}
	event.dispatch('oFollow.userPreferencesLoaded', this.entities);
}

Following.prototype.get = function() {
	var self = this;
	var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=' + this.userId;
	jsonp.get(url, 'oFollowGetCallback', function(data) {
		self.set(data);
	});
}


//TODO: refactor!
function isInList(list, toCheck) {
	return (_.filter(list, function(item) { return item.id === toCheck.id }).length > 0);
}

Following.prototype.sync = function(client, server) {
	var self = this;
	var clientOnly = _.filter(client, function(item) {
		return !isInList(server, item);
	});
	var serverOnly = _.filter(server, function(item) {
		return !isInList(client, item);
	});

	clientOnly.forEach(function(entity) {
		self.start(entity);
	});

	serverOnly.forEach(function(entity) {
		self.stop(entity);
	})
};

Following.prototype.addEntity = function(entity) {
	this.entities.push(entity);
}
Following.prototype.removeEntity = function(entity) {
	_.remove(this.entities, {'id':entity.id});
}

Following.prototype.save = function() {
	if(this.entities && this.entities.length) {
		storage.put('oFollowUserCache-'+this.userId, JSON.stringify(this.entities));
	}
}
Following.prototype.clear = function() {
	storage.delete('oFollowUserCache-'+this.userId);
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