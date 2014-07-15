/*global require,describe,beforeEach,afterEach,it,expect,spyOn*/
'use strict';

var FollowList = require('../src/js/FollowList.js');
var followButtons = require('../src/js/followButtons.js');
var jsonp = require('../src/js/lib/jsonp.js');
var user = require('../src/js/user.js');
var eventHelper = require('../src/js/lib/eventHelper');

var list, rootEl;

describe ('CreateAllin', function() {
	beforeEach(function() {
		if(list) {
			list.destroy();
		}
		spyOn(jsonp, 'get');
		rootEl = document.createElement('ul');
		rootEl.setAttribute('data-o-follow-user', '');
		rootEl.className = 'o-follow';
		document.body.appendChild(rootEl);
		list = new FollowList(rootEl);
	});



});

describe('Initialising a follow list', function() {

	beforeEach(function() {
		if(list) {
			list.destroy();
		}
		spyOn(jsonp, 'get');
		rootEl = document.createElement('ul');
		rootEl.setAttribute('data-o-follow-user', '');
		rootEl.className = 'o-follow';
		document.body.appendChild(rootEl);
		list = new FollowList(rootEl);
	});

	afterEach(function(){
	});

	it('sets up the user', function() {
		var userSpy = spyOn(user, 'init');
		spyOn(list, 'setupElements');
		list.init();
		expect(userSpy).toHaveBeenCalled();

	});

	it('initialises the buttons if the user preferences are available and there are authors', function() {
		var entity = {id:'author1', name: 'First Author'};
		var eventSpy = spyOn(eventHelper, 'dispatch');
		user.init();
		user.id = 'test';
		user.following.entities= [entity];

		list.init();

		expect(list.rootEl.hasAttribute('data-o-follow--js')).toBeTruthy();
		expect(eventSpy.callCount).toEqual(2);


		expect(eventSpy.argsForCall[0][0]).toBe('oFollow.show');
		expect(eventSpy.argsForCall[0][1]).toBe(null);
		expect(eventSpy.argsForCall[0][2]).toBe(rootEl);

		expect(eventSpy.argsForCall[1][0]).toBe('oTracking.Event');
		expect(eventSpy.argsForCall[1][1].model).toBe('oFollow');
		expect(eventSpy.argsForCall[1][1].type).toBe('show');
		expect(eventSpy.argsForCall[1][2]).toBe(window);
	});

	it('does not initialise if there are authors', function() {
		var entity = {id:'author1', name: 'First Author'};
		var eventSpy = spyOn(eventHelper, 'dispatch');
		user.init();
		user.following.entities= [entity];
		rootEl.removeAttribute('data-o-follow-user');
		list.init();
		expect(list.rootEl.hasAttribute('data-o-follow--js')).not.toBeTruthy();
		expect(eventSpy).not.toHaveBeenCalledWith('oFollow.show', null, rootEl);
	});


	it('waits for event if the user preferences are not available', function() {
		var entity = {id:'author1', name: 'First Author'};
		var btnInitSpy = spyOn(followButtons, 'init');
		list.init();
		expect(list.rootEl.hasAttribute('data-o-follow--js')).not.toBeTruthy();
		user.init();
		user.following.entities= [entity];
		eventHelper.dispatch('oFollow.userPreferencesLoad');

		expect(list.rootEl.hasAttribute('data-o-follow--js')).toBeTruthy();
		expect(btnInitSpy).toHaveBeenCalledWith(document.querySelector('.o-follow__list'));
	});
});