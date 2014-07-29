(function() {
	'use strict';
	var oFollow = require('../../main.js');

	document.addEventListener("DOMContentLoaded", function() {
    oFollow.prototype.createAllIn(document.body, {
			startFollowingText: "Follow",
			stopFollowingText: "Unfollow",
			widgetText: 'Your Alerts',
			popoverHeadingText: 'Authors',
			displayName: 'Emails for %entityName%'
		});
	});
	


}());