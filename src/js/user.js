'use strict';
var oCookies = require('o-cookies');
var oDom = require('o-dom');

exports.getId = function() {
	var userCookie = oCookies.get('FT_U');
	var id = null;
	if(userCookie) {
		var matches = userCookie.match(/_EID=(\d+)_PID/);
		if(matches && matches.length > 1) {
			id = matches[1];
		}
	}

	return '11101642';
};

