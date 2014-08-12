'use strict';

var defaults = {
	getFollowingUrl: "http://personalisation.ft.com/follow/getFollowingIds",
	startFollowingUrl: "http://personalisation.ft.com/follow/update",
	stopFollowingUrl: "http://personalisation.ft.com/follow/stopFollowing",
	metadataUrl: "http://metadata-cache.webservices.ft.com/v1/getAuthors/",
	lazyLoad: true,
	entityType: "Author",
	startFollowingText: "Start Alerts",
	stopFollowingText: "Stop Alerts",
	widgetText: "Author Alerts",
	popoverHeadingText: null,
	displayName: "%entityName%"
};


function Config() {
	this.set();
}


Config.prototype.set = function(opts) {
	var key;
	opts = opts || {};
	for(key in defaults) {
		if(defaults.hasOwnProperty(key)) {
			this[key] = (opts[key] !== undefined) ? opts[key] : (this[key] ? this[key] : defaults[key]);
		}
	}
};

module.exports = new Config();