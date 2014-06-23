'use strict';
var oCookies = require('o-cookies');
var oDom = require('o-dom');
var jsonp = require('./lib/jsonp');
var RetryableRequest = require('./lib/RetryableRequest');

var event = require('./lib/event');

function User() {
	// this.init();
}

User.prototype.init = function() {
	var self = this;
	this.id = getId();
	this.request = new RetryableRequest({
		name: 'oFollowUserPreferencesCallback',
		retry: false,
		requestCallback: function(data) {
			self.setFollowing(data);
		}
	});
	this.getFollowing();
}

function getId() {
	var userCookie = oCookies.get('FT_U');
	var id = null;
	if(userCookie) {
		var matches = userCookie.match(/_EID=(\d+)_PID/);
		if(matches && matches.length > 1) {
			id = matches[1];
		}
	}
	return '11101642';
	// return id;
};

User.prototype.setFollowing = function(data) {
	if(data.status === 'success' && data.taxonomies) {
		this.following = data.taxonomies;
		event.dispatch('oFollow.userPreferencesLoaded', this, document.body);
	}
}

User.prototype.getFollowing = function() {
	var self = this;
	var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=' + this.id;
	this.request.get(url);
}
module.exports = new User();