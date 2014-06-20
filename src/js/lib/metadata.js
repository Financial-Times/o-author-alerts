var jsonp = require('./jsonp');

exports.get = function(articleId, callback) {
	var url = 'http://metadata-cache.webservices.ft.com/v1/getAuthors/' + articleId;
	jsonp.get(url, 'oFollowMetadataCallback', callback);
}