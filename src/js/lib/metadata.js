const config = require('../config.js');
const executionQueue = require('./executionQueue');
const jsonp = require('./jsonp/jsonp');


exports.get = function(articleId, callback) {
	const url = config.get().metadataUrl + articleId;
	executionQueue.add(function (done, url, callback) {
		jsonp({
			url: url
		}, function () {
			callback.apply(this, arguments);
			done();
		});
	}, [url, callback]);
};
