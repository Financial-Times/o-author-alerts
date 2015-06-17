'use strict';

var config = require('../config.js');
var requestQueue = require('./lib/requestQueue');


exports.get = function(articleId, callback) {
	var url = config.get().metadataUrl + articleId;
	requestQueue.add({
		url: url
	}, callback);
};
