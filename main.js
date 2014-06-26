var FollowList = require('./src/js/FollowList');

document.addEventListener("o.DOMContentLoaded", function() {
    "use strict";
    FollowList.prototype.createAllIn(document.body);
});

module.exports = FollowList;