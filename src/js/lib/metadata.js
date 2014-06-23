var RetryableRequest = require('./RetryableRequest');

var req = new RetryableRequest({
	name: 'oFollowMetadataCallback',
	retry: false
})

exports.get = function(articleId, callback) {
	var url = 'http://metadata-cache.webservices.ft.com/v1/getAuthors/' + articleId;
	req.get(url, callback);
}