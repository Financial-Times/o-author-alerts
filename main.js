'use strict';

var AuthorAlerts = require('./src/js/AuthorAlerts');

document.addEventListener("o.DOMContentLoaded", function() {
	AuthorAlerts.init(document.body);
});

module.exports = AuthorAlerts;
