/*global require,describe,beforeEach,afterEach,it,expect,spyOn*/
'use strict';

var FollowComponent = require('../src/js/FollowComponent.js');
var followButtons = require('../src/js/followButtons.js');
var jsonp = require('../src/js/lib/jsonp.js');
var metadata = require('../src/js/lib/metadata.js');
var config = require('../src/js/config.js');
var user = require('../src/js/user.js');
var eventHelper = require('../src/js/lib/eventHelper');

var followComponent, rootEl, widgetEl;

describe ('CreateAllin', function() {
	beforeEach(function() {
		if(followComponent) {
			followComponent.destroy();
		}
		spyOn(jsonp, 'get');
		rootEl = document.createElement('ul');
		rootEl.setAttribute('data-o-follow-user', '');
		rootEl.className = 'o-follow';
		document.body.appendChild(rootEl);
		followComponent = new FollowComponent(rootEl);
	});

});

describe('Initialising a followComponent', function() {

	beforeEach(function() {
		if(followComponent) {
			followComponent.destroy();
		}
		spyOn(jsonp, 'get');
		rootEl = document.createElement('ul');
		rootEl.setAttribute('data-o-follow-user', '');
		rootEl.className = 'o-follow';
		document.body.appendChild(rootEl);

		followComponent = new FollowComponent(rootEl);
	});

	afterEach(function(){
	});

	it('sets up the user', function() {
		var userSpy = spyOn(user, 'init');
		spyOn(followComponent, 'setupElements');
		spyOn(followComponent, 'setupButtons');
		followComponent.init({lazyLoad: false});
		expect(userSpy).toHaveBeenCalled();

	});

	it('initialises the buttons if the user preferences are available and there are authors', function() {
		var entity = {id:'author1', name: 'First Author'};
		var eventSpy = spyOn(eventHelper, 'dispatch');
		user.init();
		user.id = 'test';
		user.following.entities= [entity];

		followComponent.init({lazyLoad: false});

		expect(followComponent.rootEl.hasAttribute('data-o-follow--js')).toBeTruthy();
		expect(eventSpy.callCount).toEqual(3);


		expect(eventSpy.argsForCall[0][0]).toBe('oFollow.entitiesLoaded');
		expect(eventSpy.argsForCall[0][1]).toBe(null);
		expect(eventSpy.argsForCall[0][2]).toBe(rootEl);

		expect(eventSpy.argsForCall[1][0]).toBe('oFollow.show');
		expect(eventSpy.argsForCall[1][1]).toBe(null);
		expect(eventSpy.argsForCall[1][2]).toBe(rootEl);


		expect(eventSpy.argsForCall[2][0]).toBe('oTracking.Data');
		expect(eventSpy.argsForCall[2][1].followme).toBe(true);
		expect(eventSpy.argsForCall[2][2]).toBe(window);
	});

	it('does not initialise if there are no authors', function() {
		var entity = {id:'author1', name: 'First Author'};
		var eventSpy = spyOn(eventHelper, 'dispatch');

		user.init();
		user.following.entities= [];
		followComponent.init({lazyLoad: false});
		expect(followComponent.rootEl.hasAttribute('data-o-follow--js')).not.toBeTruthy();
		expect(followComponent.message.textContent).toBe('Loading data...');
		expect(eventSpy).not.toHaveBeenCalledWith('oFollow.show', null, rootEl);
	});


	it('waits for event if the user preferences are not available', function() {
		var entity = {id:'author1', name: 'First Author'};
		var btnInitSpy = spyOn(followButtons, 'init');
		

		followComponent.init({lazyLoad: false});
		expect(followComponent.rootEl.hasAttribute('data-o-follow--js')).not.toBeTruthy();
		user.init();
		user.following.entities= [entity];
		eventHelper.dispatch('oFollow.userPreferencesLoad');

		expect(followComponent.rootEl.hasAttribute('data-o-follow--js')).toBeTruthy();
		expect(btnInitSpy).toHaveBeenCalledWith(document.querySelector('.o-follow__list'));
	});



});

describe('Lazy loading the calls to metadata', function() {
	it('widget lazy loads on mouseover', function() {
		widgetEl = document.createElement('ul');
		widgetEl.setAttribute('data-o-follow-article-id', 'test');
		widgetEl.className = 'o-follow o-follow--theme';
		document.body.appendChild(widgetEl);
		followComponent = new FollowComponent(widgetEl);		

		var metadataSpy = spyOn(metadata, 'get');
		user.init();
		user.id = 'test';
		user.following.entities= [];

		followComponent.init();
		//widget should be visible
		expect(followComponent.rootEl.hasAttribute('data-o-follow--js')).toBeTruthy();
		//but no call to metadata spy yet
		expect(metadataSpy).not.toHaveBeenCalled();
		//...until we mouseover
		var evObj = document.createEvent('MouseEvents');
    evObj.initEvent( 'mouseover', true, false );
    followComponent.rootEl.dispatchEvent(evObj);
    //then it should make the call
		expect(metadataSpy).toHaveBeenCalled();
	});

	it('does not lazy load if the config option set to false', function() {
		widgetEl = document.createElement('ul');
		widgetEl.setAttribute('data-o-follow-article-id', 'test');
		widgetEl.className = 'o-follow o-follow--theme';
		document.body.appendChild(widgetEl);
		followComponent = new FollowComponent(widgetEl);		

		var metadataSpy = spyOn(metadata, 'get');
		user.init();
		user.id = 'test';
		user.following.entities= [];

		followComponent.init({lazyLoad: false});
		//widget should be visible
		expect(followComponent.rootEl.hasAttribute('data-o-follow--js')).not.toBeTruthy();
		//but no call to metadata spy yet
		expect(metadataSpy).toHaveBeenCalled();
	});

	it('does not lazy load if it is not a widget', function() {
		widgetEl = document.createElement('ul');
		widgetEl.setAttribute('data-o-follow-article-id', 'test');
		widgetEl.className = 'o-follow'; //no theme class => not a widget
		document.body.appendChild(widgetEl);
		followComponent = new FollowComponent(widgetEl);		

		var metadataSpy = spyOn(metadata, 'get');
		user.init();
		user.id = 'test';
		user.following.entities= [];

		
		followComponent.init();
		//widget should be visible
		expect(followComponent.rootEl.hasAttribute('data-o-follow--js')).toBeTruthy();
		//but no call to metadata spy yet
		expect(metadataSpy).toHaveBeenCalled();
	});


});