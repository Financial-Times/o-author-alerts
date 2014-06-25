/*global require,describe,it,expect, jasmine*/
'use strict';

describe('jsonp.get()', function() {

	it('writes a script to the head of the page', function() {
		var jsonp = require('../src/js/lib/jsonp');
		var url ='http://www.test.com';
		jsonp.get(url, 'callbackName');
		var script = document.getElementsByTagName('head')[0].querySelector('script');
		expect(script).toBeTruthy();
		expect(script.getAttribute('src')).toContain(url);
    document.getElementsByTagName('head')[0].removeChild(script);
	});

	it('appends a callback name to the end of the url', function() {
		var jsonp = require('../src/js/lib/jsonp');
		jsonp.get('http://www.test.com', 'callbackName');
		jsonp.get('http://www.test.com?other=true', 'callbackName');
		var script1 = document.getElementsByTagName('head')[0].querySelectorAll('script')[0];
		var script2 = document.getElementsByTagName('head')[0].querySelectorAll('script')[1];
		expect(script1.getAttribute('src')).toEqual('http://www.test.com?callback=callbackName1');
		expect(script2.getAttribute('src')).toEqual('http://www.test.com?other=true&callback=callbackName2');
    document.getElementsByTagName('head')[0].removeChild(script1);
    document.getElementsByTagName('head')[0].removeChild(script2);
	});

	it('creates a callback function which deletes the script and itself', function() {
		var jsonp = require('../src/js/lib/jsonp');
		jsonp.get('http://www.test.com', 'testCallback');
		expect(typeof window.testCallback3).toBe('function');
		window.testCallback3('data');
		expect(typeof window.testCallback3).toBe('undefined');
		var script = document.getElementsByTagName('head')[0].querySelector('script');
		expect(script).not.toBeTruthy();
	});

	it('executes a callback if there is one passed in', function() {
		var jsonp = require('../src/js/lib/jsonp');
		var myCallback = jasmine.createSpy();
		jsonp.get('http://www.test.com', 'testCallback', myCallback);
		window.testCallback4('data');
		expect(myCallback).toHaveBeenCalledWith('data');
	});
});