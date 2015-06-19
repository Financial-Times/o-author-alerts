'use strict';

var config = require('../config.js');
var executionQueue = require('./executionQueue');
var jsonp = require('./jsonp/jsonp');


exports.get = function(articleId, callback) {
	var url = config.get().metadataUrl + articleId;
	executionQueue.add(function (done, url, callback) {
		jsonp({
			url: url
		}, function () {
			callback.apply(this, arguments);
			done();
		});
	}, [url, callback]);
};
