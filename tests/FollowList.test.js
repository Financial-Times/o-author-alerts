/*global require,describe,beforeEach,afterEach,it,expect,spyOn*/
'use strict';

var FollowList = require('../src/js/FollowList.js');
var jsonp = require('../src/js/lib/jsonp.js');
var user = require('../src/js/user.js');
var eventHelper = require('../src/js/lib/eventHelper');

var list;
describe('Initialising a follow list', function() {

	beforeEach(function() {
		spyOn(jsonp, 'get');
		var rootEl = document.createElement('ul');
		rootEl.className = 'o-follow';
		document.body.appendChild(rootEl);
		list = new FollowList(rootEl);
	});

	afterEach(function(){
		list.destroy();
	});

	it('sets up the user', function() {
		var userSpy = spyOn(user, 'init');
		list.init();
		expect(userSpy).toHaveBeenCalled();
	});

	it('initialises the buttons if the user preferences are available', function() {
		var entity = {id:'author1', name: 'First Author'};
		user.init();
		user.following.entities = entity;
		list.init();

		expect(list.rootEl.hasAttribute('data-o-follow--js')).toBeTruthy();
	});

	it('waits for event if the user preferences are not available', function() {
		var entity = {id:'author1', name: 'First Author'};
		list.init();
		expect(list.rootEl.hasAttribute('data-o-follow--js')).not.toBeTruthy();

		user.following.entities = entity;
		eventHelper.dispatch('oFollow.ready');

		expect(list.rootEl.hasAttribute('data-o-follow--js')).toBeTruthy();
	});
});