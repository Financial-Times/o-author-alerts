'use strict';

var jsonp = require('./lib/jsonp');

function Following(userId) {
	this.userId = userId;
	this.online = false;
	this.entities = [];
}

Following.prototype.set = function(data) {
	if(data.status === 'success' && data.taxonomies) {
		this.online = true;
		this.entities = data.taxonomies;
	}
}

Following.prototype.get = function() {
	var self = this;
	var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=' + this.userId;
	jsonp.get(url, 'oFollowGetCallback', function(data) {
		self.set(data)
	});
}


Following.prototype.start = function(entity) {
	if(!(this.userId && entity.id && entity.name)) return;
	var url = 'http://personalisation.ft.com/follow/update?userId=' + 
			this.userId + '&type=authors&name=' +
			entity.name + '&id=' +
			entity.id;
		jsonp.get(url, 'oFollowStartCallback');
}

Following.prototype.stop = function(entity, userId) {
	if(!(this.userId && entity.id && entity.name)) return;
	var url = 'http://personalisation.ft.com/follow/stopFollowing?userId=' + 
			this.userId + '&type=authors&id='+
			entity.id;
		jsonp.get(url, 'oFollowStopCallback');
}

module.exports = Following;