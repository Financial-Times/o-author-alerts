/*global require,describe,it,expect,spyOn*/
const metadata = require('../src/js/lib/metadata');
const jsonp = require('../src/js/lib/jsonp/jsonp');

describe('Metadata Cache Retriever', function () {
	it('gets the metadata cache for a url', function () {
		const callback = function () {};
		const getSpy = spyOn(jsonp, 'get');
		metadata.get('testId', callback);
		const expectedUrl = 'http://metadata-cache.webservices.ft.com/v1/getAuthors/testId';
		expect(getSpy).toHaveBeenCalledWith(expectedUrl, 'oFollowMetadataCallback', callback);
	});
});