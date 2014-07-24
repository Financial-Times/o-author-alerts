'use strict';

var defaults = {
	getFollowingUrl: "http://personalisation.ft.com/follow/getFollowingIds",
	startFollowingUrl: "http://personalisation.ft.com/follow/update",
	stopFollowingUrl: "http://personalisation.ft.com/follow/stopFollowing",
	metadataUrl: "http://metadata-cache.webservices.ft.com/v1/getAuthors/",
	entityType: "Author",
	startFollowingText: "Start",
	stopFollowingText: "Stop",
	widgetText: "Author Alerts",
	popoverHeadingText: "Get alerts for:"
};


function Config() {
	this.set();
}


Config.prototype.set = function(opts) {
	var key;
	opts = opts || {};
	for(key in defaults) {
		if(defaults.hasOwnProperty(key)) {
			this[key] = opts[key] || defaults[key];
		}
	}
};

module.exports = new Config();