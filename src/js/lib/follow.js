'use strict';

var jsonp = require('./jsonp');

exports.start = function(entity, userId) {
	if(!(userId && entity.id && entity.name)) return;
	var url = 'http://personalisation.ft.com/follow/update?userId=' + 
			userId + '&type=authors&name=' +
			entity.name + '&id=' +
			entity.id;
		jsonp.get(url, 'oFollowPersonalisationCallback');
}

exports.stop = function(entity, userId) {
	if(!(userId && entity.id && entity.name)) return;
	var url = 'http://personalisation.ft.com/follow/stopFollowing?userId=' + 
			userId + '&type=authors&id='+
			entity.id;
		jsonp.get(url, 'oFollowPersonalisationCallback');
}
