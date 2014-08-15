'use strict';

var defaults = {
	getFollowingUrl: "http://personalisation.ft.com/follow/getFollowingIds",
	startAlertsUrl: "http://personalisation.ft.com/follow/update",
	stopAlertsUrl: "http://personalisation.ft.com/follow/stopFollowing",
	metadataUrl: "http://metadata-cache.webservices.ft.com/v1/getAuthors/",
	lazyLoad: true,
	entityType: "Author",
	startAlertsText: "Start alerts",
	stopAlertsText: "Alerting<i class=\"o-author-alerts__icon--tick\"></i>",
	widgetText: "Author alerts",
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