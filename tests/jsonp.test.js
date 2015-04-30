/*global require,describe,it,expect, jasmine, beforeEach */
'use strict';

var jsonp = require('../src/js/lib/jsonp');

describe('jsonp.get()', function() {
	beforeEach(function() {
		jsonp.reset();
	});

	it('writes a script to the head of the page', function() {
		var url ='http://www.test.com';
		jsonp.get(url, 'callbackName');
		var script = document.getElementsByTagName('head')[0].querySelector('script');
		expect(script).toBeTruthy();
		expect(script.getAttribute('src')).toContain(url);
		document.getElementsByTagName('head')[0].removeChild(script);
	});

	it('appends a callback name to the end of the url', function() {
		jsonp.get('http://www.test.com', 'callbackName');
		var script1 = document.getElementsByTagName('head')[0].querySelectorAll('script')[0];
		expect(script1.getAttribute('src')).toEqual('http://www.test.com?callback=callbackName0');
		document.getElementsByTagName('head')[0].removeChild(script1);
	});

	it('appends a callback name to the end of another query param', function() {
		jsonp.get('http://www.test.com?other=true', 'callbackName');
		var script1 = document.getElementsByTagName('head')[0].querySelectorAll('script')[0];
		expect(script1.getAttribute('src')).toEqual('http://www.test.com?other=true&callback=callbackName0');
		document.getElementsByTagName('head')[0].removeChild(script1);
	});


	it('creates a callback function which deletes the script and itself', function() {
		jsonp.get('http://www.test.com', 'testCallback');
		expect(typeof window.testCallback0).toBe('function');
		window.testCallback0('data');
		expect(typeof window.testCallback0).toBe('undefined');
		var script = document.getElementsByTagName('head')[0].querySelector('script');
		expect(script).not.toBeTruthy();
	});

	it('executes a callback if there is one passed in', function() {
		var myCallback = jasmine.createSpy();
		jsonp.get('http://www.test.com', 'testCallback', myCallback);
		window.testCallback0('data');
		expect(myCallback).toHaveBeenCalledWith('data');
	});

	it('queues up requests', function() {
		jsonp.get('request1', 'testCallback');
		jsonp.get('request2', 'testCallback');
		var scripts = document.getElementsByTagName('head')[0].querySelectorAll('script');
		expect(scripts.length).toEqual(1);
		expect(scripts[0].getAttribute('src')).toBe('request1?callback=testCallback0');

		window.testCallback0();

		scripts = document.getElementsByTagName('head')[0].querySelectorAll('script');
		expect(scripts.length).toEqual(1);
		expect(scripts[0].getAttribute('src')).toBe('request2?callback=testCallback1');


	});
});
