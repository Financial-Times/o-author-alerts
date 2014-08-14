/*global require,describe,beforeEach,afterEach,it,expect,spyOn*/
'use strict';

var AuthorAlerts = require('../src/js/AuthorAlerts.js');
var buttons = require('../src/js/buttons.js');
var jsonp = require('../src/js/lib/jsonp.js');
var metadata = require('../src/js/lib/metadata.js');
var config = require('../src/js/config.js');
var user = require('../src/js/user.js');
var eventHelper = require('../src/js/lib/eventHelper');

var authorAlerts, rootEl, widgetEl;

describe ('CreateAllin', function() {
	beforeEach(function() {
		if(authorAlerts) {
			authorAlerts.destroy();
		}
		spyOn(jsonp, 'get');
		rootEl = document.createElement('ul');
		rootEl.setAttribute('data-o-author-alerts-user', '');
		rootEl.className = 'o-author-alerts';
		document.body.appendChild(rootEl);
		authorAlerts = new AuthorAlerts(rootEl);
	});

});

describe('Initialising authorAlerts', function() {

	beforeEach(function() {
		if(authorAlerts) {
			authorAlerts.destroy();
		}
		spyOn(jsonp, 'get');
		rootEl = document.createElement('ul');
		rootEl.setAttribute('data-o-author-alerts-user', '');
		rootEl.className = 'o-author-alerts';
		document.body.appendChild(rootEl);

		authorAlerts = new AuthorAlerts(rootEl);
	});

	afterEach(function(){
	});

	it('sets up the user', function() {
		var userSpy = spyOn(user, 'init');
		spyOn(authorAlerts, 'setupElements');
		spyOn(authorAlerts, 'setupButtons');
		authorAlerts.init({lazyLoad: false});
		expect(userSpy).toHaveBeenCalled();

	});

	it('initialises the buttons if the user preferences are available and there are authors', function() {
		var entity = {id:'author1', name: 'First Author'};
		var eventSpy = spyOn(eventHelper, 'dispatch');
		user.init();
		user.id = 'test';
		user.subscription.entities= [entity];

		authorAlerts.init({lazyLoad: false});

		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).toBeTruthy();
		expect(eventSpy.callCount).toEqual(3);


		expect(eventSpy.argsForCall[0][0]).toBe('oAuthorAlerts.entitiesLoaded');
		expect(eventSpy.argsForCall[0][1]).toBe(null);
		expect(eventSpy.argsForCall[0][2]).toBe(rootEl);

		expect(eventSpy.argsForCall[1][0]).toBe('oAuthorAlerts.show');
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
		user.subscription.entities= [];
		authorAlerts.init({lazyLoad: false});
		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).not.toBeTruthy();
		expect(authorAlerts.message.textContent).toBe('Loading data...');
		expect(eventSpy).not.toHaveBeenCalledWith('oAuthorAlerts.show', null, rootEl);
	});


	it('waits for event if the user preferences are not available', function() {
		var entity = {id:'author1', name: 'First Author'};
		var btnInitSpy = spyOn(buttons, 'init');
		

		authorAlerts.init({lazyLoad: false});
		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).not.toBeTruthy();
		user.init();
		user.subscription.entities= [entity];
		eventHelper.dispatch('oAuthorAlerts.userPreferencesLoad');

		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).toBeTruthy();
		expect(btnInitSpy).toHaveBeenCalledWith(document.querySelector('.o-author-alerts__list'));
	});



});

describe('Lazy loading the calls to metadata', function() {
	it('widget lazy loads on mouseover', function() {
		widgetEl = document.createElement('ul');
		widgetEl.setAttribute('data-o-author-alerts-article-id', 'test');
		widgetEl.className = 'o-author-alerts o-author-alerts--theme';
		document.body.appendChild(widgetEl);
		authorAlerts = new AuthorAlerts(widgetEl);		

		var metadataSpy = spyOn(metadata, 'get');
		user.init();
		user.id = 'test';
		user.subscription.entities= [];

		authorAlerts.init();
		//widget should be visible
		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).toBeTruthy();
		//but no call to metadata spy yet
		expect(metadataSpy).not.toHaveBeenCalled();
		//...until we mouseover
		var evObj = document.createEvent('MouseEvents');
    evObj.initEvent( 'mouseover', true, false );
    authorAlerts.rootEl.dispatchEvent(evObj);
    //then it should make the call
		expect(metadataSpy).toHaveBeenCalled();
	});

	it('does not lazy load if the config option set to false', function() {
		widgetEl = document.createElement('ul');
		widgetEl.setAttribute('data-o-author-alerts-article-id', 'test');
		widgetEl.className = 'o-author-alerts o-author-alerts--theme';
		document.body.appendChild(widgetEl);
		authorAlerts = new AuthorAlerts(widgetEl);		

		var metadataSpy = spyOn(metadata, 'get');
		user.init();
		user.id = 'test';
		user.subscription.entities= [];

		authorAlerts.init({lazyLoad: false});
		//widget should be visible
		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).not.toBeTruthy();
		//but no call to metadata spy yet
		expect(metadataSpy).toHaveBeenCalled();
	});

	it('does not lazy load if it is not a widget', function() {
		widgetEl = document.createElement('ul');
		widgetEl.setAttribute('data-o-author-alerts-article-id', 'test');
		widgetEl.className = 'o-author-alerts'; //no theme class => not a widget
		document.body.appendChild(widgetEl);
		authorAlerts = new AuthorAlerts(widgetEl);		

		var metadataSpy = spyOn(metadata, 'get');
		user.init();
		user.id = 'test';
		user.subscription.entities= [];

		
		authorAlerts.init();
		//widget should be visible
		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).toBeTruthy();
		//but no call to metadata spy yet
		expect(metadataSpy).toHaveBeenCalled();
	});


});