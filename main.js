'use strict';

var FollowComponent = require('./src/js/FollowComponent');

document.addEventListener("o.DOMContentLoaded", function() {
    FollowComponent.prototype.createAllIn(document.body);
});

module.exports = FollowComponent;