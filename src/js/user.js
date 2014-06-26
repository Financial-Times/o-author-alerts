'use strict';

var oCookies = require('o-cookies');
var Following = require('./Following');

function User() {

}

User.prototype.init = function() {
	if(!this.id) {
		this.id = getId();
		this.following = new Following(this.id);
		this.following.get();
	}
};

User.prototype.destroy = function() {
	this.following = null;
	this.id = null;
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

	//TODO: get rid of my id!
	
	return id || '11101642';
}


module.exports = new User();