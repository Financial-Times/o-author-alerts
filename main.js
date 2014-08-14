'use strict';

var AuthorAlerts = require('./src/js/AuthorAlerts');

document.addEventListener("o.DOMContentLoaded", function() {
    AuthorAlerts.prototype.createAllIn(document.body);
});

module.exports = AuthorAlerts;