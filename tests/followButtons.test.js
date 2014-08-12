/*global require,describe,beforeEach,afterEach,it,expect,spyOn*/
'use strict';

var followButtons = require('../src/js/followButtons.js');
var views = require('../src/js/views.js');
var jsonp = require('../src/js/lib/jsonp.js');
var eventHelper = require('../src/js/lib/eventHelper.js');
var user = require('../src/js/user.js');

var testEl;




describe('Initialising a button', function() {

	beforeEach(function() {
		spyOn(jsonp, 'get');
		user.init();
		user.id = 'userId';
		testEl = document.createElement('div');
		testEl.id = 'testEl';
		document.body.appendChild(testEl);

	});

	afterEach(function() {
		document.body.removeChild(testEl);
	});

	it('sets the initial state assuming that the user is initialised', function() {
		var entity = {id: 'author1', name: 'First Author'};
		views.button(testEl, entity);
		user.following.entities  = [entity];
		followButtons.init(testEl);
		var button = testEl.querySelector('[data-o-follow-id]');		
		expect(button.innerText).toBe('Stop Alerts');
	});

});

describe('Clicking the button', function() {

	beforeEach(function() {
		spyOn(jsonp, 'get');
		user.destroy();
		user.init();
		user.id = 'userId';
		testEl = document.createElement('div');
		testEl.id = 'testEl';
		document.body.appendChild(testEl);

	});

	afterEach(function() {
		document.body.removeChild(testEl);
	});

	it('toggles between states', function() {
		var entity = {id: 'author1', name: 'First Author'};
		views.button(testEl, entity);

		user.following.entities  = [];
		var stopSpy = spyOn(user.following, 'stop');
		var startSpy = spyOn(user.following, 'start');
		var eventSpy = spyOn(eventHelper, 'dispatch');

		followButtons.init(testEl);
		var button = testEl.querySelector('[data-o-follow-id]');
		button.click();

		expect(startSpy).toHaveBeenCalledWith(entity, 'userId');
		// expect(button.el.innerText).toBe('Stop Following');
		expect(button.getAttribute('data-o-follow-state')).toBe('true');
		
		expect(eventSpy).toHaveBeenCalledWith('oTracking.Event', {
			model: 'followme', type: 'follow', value: 'First Author'
		}, window);


		button.click();
		
		expect(stopSpy).toHaveBeenCalledWith(entity, 'userId');
		// expect(button.el.innerText).toBe('Start Following');
		expect(button.getAttribute('data-o-follow-state')).toBe('false');

		expect(eventSpy).toHaveBeenCalledWith('oTracking.Event', {
			model: 'followme', type: 'unfollow', value: 'First Author'
		}, window);


	});
});
