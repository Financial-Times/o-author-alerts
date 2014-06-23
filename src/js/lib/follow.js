'use strict';

var RetryableRequest = require('./RetryableRequest');
var user = require('../user');


function Follow() {
	this.request = null;
}

Follow.prototype.init = function() {
	this.request = new RetryableRequest({
		name: 'oFollowPersonalisationRequest',
		retry: true,
		maxRetries: 10
		// requestCallback: user.setFollowing
	});

	var self = this;
	return new Promise(function(resolve, reject) {
		self.request.init().then(function(data) {
			resolve(data);
		});
	});

}

//Exposing this for the test (otherwise requests will just queue up)
Follow.prototype.destroy = function() {
	this.request.clearQueue();
}

Follow.prototype.start = function(entity, userId) {
	if(!(userId && entity.id && entity.name)) return;
	var url = 'http://personalisation.ft.com/follow/update?userId=' + 
			userId + '&type=authors&name=' +
			entity.name + '&id=' +
			entity.id;
		this.request.get(url);
}

Follow.prototype.stop = function(entity, userId) {
	if(!(userId && entity.id && entity.name)) return;
	var url = 'http://personalisation.ft.com/follow/stopFollowing?userId=' + 
			userId + '&type=authors&id='+
			entity.id;

	this.request.get(url);
}


module.exports = new Follow();