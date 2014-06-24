/*global require,describe,beforeEach,afterEach,it,expect*/

var RetryableRequest = require('../src/js/lib/RetryableRequest');
var jsonp =  require('../src/js/lib/jsonp');


describe('Construction', function() {

	it('creates an object with defaults', function() {

		var req = new RetryableRequest();
		expect(req.name).toEqual('oFollowRequest');
		expect(req.retry).toBe(true);
		expect(req.maxRetries).toBe(4);
	});


	it('creates an object with passed in settings', function() {

		var req = new RetryableRequest({
			name: 'myRequest',
			retry: false,
			maxRetries: 1
		});
		expect(req.name).toEqual('myRequest');
		expect(req.retry).toBe(false);
		expect(req.maxRetries).toBe(1);
	});
});

describe('Making a get request', function() {

	it('makes a call to jsonp get', function() {
		var getSpy = spyOn(jsonp, 'get');
		var req = new RetryableRequest({
			name: 'myRequest'
		});
		var callback = function() {

		};
		req.get('http://www.url.com', callback);
		expect(getSpy).toHaveBeenCalledWith('http://www.url.com', 'myRequest', callback);
	})
});