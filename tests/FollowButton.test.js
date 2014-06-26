/*global require,describe,beforeEach,afterEach,it,expect,spyOn*/
'use strict';

var FollowButton = require('../src/js/FollowButton.js');
var followButtonView = require('../src/js/followButtonView.js');
var jsonp = require('../src/js/lib/jsonp.js');
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

	it('sets up the entity', function() {
		var entity = {id: 'testId', name: 'testName'};
		followButtonView.render(testEl, entity);

		user.following.entities = [];
		var button = new FollowButton(testEl.querySelector('[data-o-follow-id]'));
		expect(button.entity.id).toBe(entity.id);
		expect(button.entity.name).toBe(entity.name);
	});

	it('sets the initial state assuming that the user is initialised', function() {
		var entity = {id: 'author1', name: 'First Author'};
		followButtonView.render(testEl, entity);
		user.following.entities  = [entity];
		var button = new FollowButton(testEl.querySelector('[data-o-follow-id]'));
		expect(button.el.innerText).toBe('Stop Following');
	});

});

describe('Clicking the button', function() {

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

	it('toggles between states', function() {
		var entity = {id: 'author1', name: 'First Author'};
		followButtonView.render(testEl, entity);

		user.following.entities  = [];
		var stopSpy = spyOn(user.following, 'stop');
		var startSpy = spyOn(user.following, 'start');
		var button = new FollowButton(testEl.querySelector('[data-o-follow-id]'));
		button.el.click();

		expect(startSpy).toHaveBeenCalledWith(entity, 'userId');
		// expect(button.el.innerText).toBe('Stop Following');
		expect(button.el.getAttribute('data-o-follow-state')).toBe('true');

		button.el.click();
		expect(stopSpy).toHaveBeenCalledWith(entity, 'userId');
		// expect(button.el.innerText).toBe('Start Following');
		expect(button.el.getAttribute('data-o-follow-state')).toBe('false');
	});
});
