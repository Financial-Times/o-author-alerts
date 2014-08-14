(function() {
	'use strict';
	var oAuthorAlerts = require('../../main.js');

	document.addEventListener("DOMContentLoaded", function() {
    oAuthorAlerts.init(document.body, {
			startFollowingText: "Start following %entityName%",
			stopFollowingText: "Stop following %entityName%",
			displayName: false
		});
	});
	


}());