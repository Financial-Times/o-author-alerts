const defaultConfig = require('./config.json');
const config = require('./src/js/config.js');

config.set(defaultConfig);

const AuthorAlerts = require('./src/js/AuthorAlerts');

document.addEventListener("o.DOMContentLoaded", function() {
	try {
		const configInDomEl = document.querySelector('script[type="application/json"][data-o-author-alerts-config]');
		if (configInDomEl) {
			const configInDom = JSON.parse(configInDomEl.innerHTML);

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
