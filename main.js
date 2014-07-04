'use strict';

var FollowList = require('./src/js/FollowList');

document.addEventListener("o.DOMContentLoaded", function() {
    FollowList.prototype.createAllIn(document.body);
});

module.exports = FollowList;