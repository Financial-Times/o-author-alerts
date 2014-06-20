'use strict';
var oCookies = require('o-cookies');
var oDom = require('o-dom');
var jsonp = require('./lib/jsonp');
var event = require('./lib/event');

function User() {
	this.id = getId();
	this.getFollowing()
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
};

User.prototype.setUserFollowing = function(data) {
	if(data.status === 'success' && data.taxonomies) {
		this.following = data.taxonomies;
		event.dispatch('oFollow.userPreferencesLoaded', this, document.body);
	}
}

User.prototype.getFollowing = function() {
	var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=' + this.id;
	jsonp.get(url, 'getUserFollowingCallback', this.setUserFollowing.bind(this));
}

module.exports = new User();