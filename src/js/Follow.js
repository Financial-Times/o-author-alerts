'use strict';

var user = require('./user');
var jsonp = require('./jsonp');

function Follow(id, name, type) {
	this.type = type || 'author';
	this.id = id;
	this.userId = user.getId();
	this.name = name
}


Follow.prototype.start = function() {
	if(!(this.userId && this.id)) return;
	var url = 'http://personalisation.ft.com/follow/update?userId=' + 
			this.userId + '&type=authors&name=' +
			this.name + '&id=' +
			this.id + '&callback=personalisationRequestCallback'
		jsonp.get(url, null, 'personalisationRequestCallback');
};

Follow.prototype.stop = function() {
	if(!(this.userId && this.id)) return;
	var url = 'http://personalisation.ft.com/follow/stopFollowing?userId=' + 
			this.userId + '&type=authors&id='+
			this.id + '&callback=personalisationRequestCallback'
		jsonp.get(url, null, 'personalisationRequestCallback');
}

module.exports = Follow;