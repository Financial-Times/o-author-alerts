'use strict';

var jsonp = require('./jsonp'),
		config = require('../config.js');


exports.get = function(articleId, callback) {
	var url = config.metadataUrl + articleId;
	jsonp.get(url, 'oFollowMetadataCallback', callback);
};