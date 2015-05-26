'use strict';

var defaultConfig = require('./config.json');
var config = require('./src/js/config.js');

config.set(defaultConfig);

var AuthorAlerts = require('./src/js/AuthorAlerts');

document.addEventListener("o.DOMContentLoaded", function() {
	try {
		var configInDomEl = document.querySelector('script[type="application/json"][data-o-author-alerts-config]');
		if (configInDomEl) {
			var configInDom = JSON.parse(configInDomEl.innerHTML);

			config.set(configInDom);
		}
	} catch (e) {
		// invalid config
	}

	AuthorAlerts.init(document.body);
});

module.exports = AuthorAlerts;
module.exports.setConfig = function () {
	config.set.apply(this, arguments);
};
