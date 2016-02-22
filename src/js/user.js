'use strict';

var oCookies = require('o-cookies');
var Subscription = require('./Subscription');

/* Singleton User object */
function User() {

}

User.prototype.init = function() {
	// If it hasn't already been initialized...
	if (!(this.id && this.subscription)) {
		this.id = oCookies.get('FTSession');
		console.log('dd-ses', this.id);
		this.subscription = new Subscription(this.id);

		if (this.id) {
			this.subscription.get();
		}
		console.log('dd-subs', this.subscription);
	}
};

User.prototype.destroy = function() {
	this.subscription = null;
	this.id = null;
};


module.exports = new User();
