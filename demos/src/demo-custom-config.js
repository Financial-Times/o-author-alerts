(function() {
	const oAuthorAlerts = require('../../main.js');

	document.addEventListener("DOMContentLoaded", function() {
		oAuthorAlerts.init(document.body, {
			startFollowingText: "Follow",
			stopFollowingText: "Unfollow",
			widgetText: 'Your Alerts',
			popoverHeadingText: 'Authors',
			displayName: '%entityName%'
		});
	});



}());
