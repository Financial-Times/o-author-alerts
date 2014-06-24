'use strict';
var oCookies = require('o-cookies');
var oDom = require('o-dom');
var jsonp = require('./lib/jsonp');
var event = require('./lib/event');
var Following = require('./Following')

function User() {
	// this.init();
}

User.prototype.init = function() {
	this.id = getId();
	this.following = new Following(this.id);
	this.following.get();
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

	// return id;
	return id || '11101642';
};


module.exports = new User();