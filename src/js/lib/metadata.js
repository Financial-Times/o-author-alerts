var RetryableRequest = require('./RetryableRequest');


exports.get = function(articleId, callback) {
	var req = new RetryableRequest({
		name: 'oFollowMetadataCallback',
		retry: false,
		success: callback
	});
	var url = 'http://metadata-cache.webservices.ft.com/v1/getAuthors/' + articleId;
	req.get(url);
}