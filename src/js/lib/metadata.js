'use strict';

var jsonp = require('./jsonp/jsonp'),
		config = require('../config.js');


exports.get = function(articleId, callback) {
	var url = config.get().metadataUrl + articleId;
	jsonp({
		url: url
	}, callback);
};
