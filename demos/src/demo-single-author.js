(function() {
	const oAuthorAlerts = require('../../main.js');

	document.addEventListener("DOMContentLoaded", function() {
		oAuthorAlerts.init(document.body, {
			startFollowingText: "Start alerts for %entityName%",
			stopFollowingText: "Stop alerts for %entityName%",
			displayName: false
		});
	});



}());
