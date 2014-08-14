'use strict';

var oCookies = require('o-cookies');
var Subscription = require('./Subscription');

function User() {

}

User.prototype.init = function() {
	if(!(this.id && this.subscription)) {
		this.id = oCookies.getParam('FT_User', 'ERIGHTSID');
		this.subscription = new Subscription(this.id);
		if(this.id) {
			this.subscription.get();
		}
	}
};

User.prototype.destroy = function() {
	this.subscription = null;
	this.id = null;
};


module.exports = new User();