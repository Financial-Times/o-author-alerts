'use strict';

var RetryableRequest = require('./RetryableRequest');
var user = require('../user');
var req = new RetryableRequest({
	name: 'oFollowPersonalisationRequest',
	retry: true,
	maxRetries: 3,
	requestCallback: user.setFollowing
});

//Exposing this for the test (otherwise requests will just queue up)
exports.clearQueue = function() {
	req.clearQueue();
}

exports.start = function(entity, userId) {
	if(!(userId && entity.id && entity.name)) return;
	var url = 'http://personalisation.ft.com/follow/update?userId=' + 
			userId + '&type=authors&name=' +
			entity.name + '&id=' +
			entity.id;
		req.get(url);
}

exports.stop = function(entity, userId) {
	if(!(userId && entity.id && entity.name)) return;
	var url = 'http://personalisation.ft.com/follow/stopFollowing?userId=' + 
			userId + '&type=authors&id='+
			entity.id;

	req.get(url);
}
