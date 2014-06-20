/*global require,describe,beforeEach,afterEach,it,expect,spyOn*/

var metadata = require('../src/js/lib/metadata.js'),
	jsonp =  require('../src/js/lib/jsonp.js');

describe('Metadata Cache Retriever', function() {

	it('gets the metadata cache for a url', function() {
		var callback = function() {}
		var getSpy = spyOn(jsonp, 'get');
		metadata.get('testId', callback);
		var expectedUrl = 'http://metadata-cache.webservices.ft.com/v1/getAuthors/testId';
		expect(getSpy).toHaveBeenCalledWith(expectedUrl,'metadataCallback', callback);
	});
});