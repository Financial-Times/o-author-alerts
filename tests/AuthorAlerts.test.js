/*global require,describe,beforeEach,afterEach,it,expect,spyOn*/

const AuthorAlerts = require('../src/js/AuthorAlerts.js');
const buttons = require('../src/js/buttons.js');
const metadata = require('../src/js/lib/metadata.js');
const user = require('../src/js/user.js');
const eventHelper = require('../src/js/lib/eventHelper');

let authorAlerts;
let rootEl;
let widgetEl;

const defaultConfig = require('../config.json');
const config = require('../src/js/config.js');

config.set(defaultConfig);

describe ('CreateAllin', function() {
	beforeEach(function() {
		if(authorAlerts) {
			authorAlerts.destroy();
		}
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
		rootEl = document.createElement('ul');
		rootEl.setAttribute('data-o-author-alerts-user', '');
		rootEl.className = 'o-author-alerts';
		document.body.appendChild(rootEl);

		authorAlerts = new AuthorAlerts(rootEl);
	});

	it('sets up the user', function() {
		const userSpy = spyOn(user, 'init');
		spyOn(authorAlerts, 'createView');
		spyOn(authorAlerts, 'setupAuthorButtons');
		authorAlerts.init({lazyLoad: false});
		expect(userSpy).toHaveBeenCalled();

	});

	it('initialises the buttons if the user preferences are available and there are authors', function() {
		const entity = {id:'author1', name: 'First Author'};
		const eventSpy = spyOn(eventHelper, 'dispatch');
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
		const eventSpy = spyOn(eventHelper, 'dispatch');

		user.init();
		user.subscription.entities= [];
		authorAlerts.init({lazyLoad: false});
		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).not.toBeTruthy();
		expect(authorAlerts.rootEl.querySelector('.o-author-alerts__message').textContent).toBe('Loading data...');
		expect(eventSpy).not.toHaveBeenCalledWith('oAuthorAlerts.show', null, rootEl);
	});


	it('waits for event if the user preferences are not available', function() {
		const entity = {id:'author1', name: 'First Author'};
		const btnInitSpy = spyOn(buttons, 'init');


		authorAlerts.init({lazyLoad: false});
		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).not.toBeTruthy();
		user.init();
		user.subscription.entities= [entity];
		eventHelper.dispatch('oAuthorAlerts.userPreferencesLoad');

		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).toBeTruthy();
		expect(btnInitSpy).toHaveBeenCalledWith(authorAlerts.rootEl);
	});



});

describe('Lazy loading the calls to metadata', function() {
	it('widget lazy loads on mouseover', function() {
		widgetEl = document.createElement('ul');
		widgetEl.setAttribute('data-o-author-alerts-article-id', 'test');
		widgetEl.className = 'o-author-alerts o-author-alerts--theme';
		document.body.appendChild(widgetEl);
		authorAlerts = new AuthorAlerts(widgetEl);

		const metadataSpy = spyOn(metadata, 'get');
		user.init();
		user.id = 'test';
		user.subscription.entities= [];

		authorAlerts.init({lazyLoad: true});
		//widget should be visible
		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).toBeTruthy();
		//but no call to metadata spy yet
		expect(metadataSpy).not.toHaveBeenCalled();
		//...until we mouseover
		const evObj = document.createEvent('MouseEvents');
		evObj.initEvent( 'mouseover', true, false );
		authorAlerts.rootEl.dispatchEvent(evObj);
		//then it should make the call
		expect(metadataSpy).toHaveBeenCalled();
	});

	it('widget lazy loads on focus for keyboard users', function() {
		widgetEl = document.createElement('ul');
		widgetEl.setAttribute('data-o-author-alerts-article-id', 'test');
		widgetEl.className = 'o-author-alerts o-author-alerts--theme';
		document.body.appendChild(widgetEl);
		authorAlerts = new AuthorAlerts(widgetEl);

		const metadataSpy = spyOn(metadata, 'get');
		user.init();
		user.id = 'test';
		user.subscription.entities= [];

		authorAlerts.init();
		//widget should be visible
		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).toBeTruthy();
		//but no call to metadata spy yet
		expect(metadataSpy).not.toHaveBeenCalled();
		//...until we focus
		authorAlerts.widget.widget.focus();
		//then it should make the call
		expect(metadataSpy).toHaveBeenCalled();
	});

	it('widget does not create duplicate buttons with lazy loading', function() {
		widgetEl = document.createElement('ul');
		widgetEl.setAttribute('data-o-author-alerts-user', '');
		widgetEl.className = 'o-author-alerts o-author-alerts--theme';
		document.body.appendChild(widgetEl);
		authorAlerts = new AuthorAlerts(widgetEl);

		user.init();
		user.id = 'test';
		user.subscription.entities= [{id:'author1', name: 'First Author'}];

		authorAlerts.init();
		//widget should be visible
		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).toBeTruthy();
		//but no call to metadata spy yet

		const evObj = document.createEvent('MouseEvents');
		evObj.initEvent( 'mouseover', true, false );
		authorAlerts.rootEl.dispatchEvent(evObj);
		//then it should make the call
		authorAlerts.widget.widget.focus();
		expect(widgetEl.querySelectorAll('.o-author-alerts__controls').length).toBe(1);

	});

	it('does not lazy load if the config option set to false', function() {
		widgetEl = document.createElement('ul');
		widgetEl.setAttribute('data-o-author-alerts-article-id', 'test');
		widgetEl.className = 'o-author-alerts o-author-alerts--theme';
		document.body.appendChild(widgetEl);
		authorAlerts = new AuthorAlerts(widgetEl);

		const metadataSpy = spyOn(metadata, 'get');
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

		const metadataSpy = spyOn(metadata, 'get');
		user.init();
		user.id = 'test';
		user.subscription.entities= [];


		authorAlerts.init({lazyLoad: true});
		//widget should be visible
		expect(authorAlerts.rootEl.hasAttribute('data-o-author-alerts--js')).toBeTruthy();
		//but no call to metadata spy yet
		expect(metadataSpy).toHaveBeenCalled();
	});


});
