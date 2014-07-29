'use strict';

var oCookies = require('o-cookies');
var Following = require('./Following');

function User() {

}

User.prototype.init = function() {
	if(!(this.id && this.following)) {
		this.id = oCookies.getParam('FT_User', 'ERIGHTSID');
		this.following = new Following(this.id);
		if(this.id) {
			this.following.get();
		}
	}
};

User.prototype.destroy = function() {
	this.following = null;
	this.id = null;
};


module.exports = new User();