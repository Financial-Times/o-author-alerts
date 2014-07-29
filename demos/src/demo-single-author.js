(function() {
	'use strict';
	var oFollow = require('../../main.js');

	document.addEventListener("DOMContentLoaded", function() {
    oFollow.prototype.createAllIn(document.body, {
			startFollowingText: "Start following %entityName%",
			stopFollowingText: "Stop following %entityName%",
			displayName: false
		});
	});
	


}());