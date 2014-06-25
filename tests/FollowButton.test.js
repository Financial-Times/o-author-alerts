var FollowButton = require('../src/js/FollowButton.js');
var followButtonView = require('../src/js/followButtonView.js');
var jsonp = require('../src/js/lib/jsonp.js');
var user = require('../src/js/user.js');
var event = require('../src/js/lib/event');

var testEl;
describe('Initialising a button', function() {

	beforeEach(function() {
		spyOn(jsonp, 'get');
		user.init();
		user.id = 'userId'
		testEl = document.createElement('div');
		testEl.id = 'testEl';
		document.body.appendChild(testEl);
	});

	afterEach(function() {
		document.body.removeChild(testEl);
	});

	it('renders', function() {

		var viewSpy = spyOn(followButtonView, 'render').andCallThrough();
		user.following.entities = [];
		new FollowButton(testEl, 'myEntity');
		expect(viewSpy).toHaveBeenCalledWith(testEl, 'myEntity');
	});

	it('adds a click event', function() {
		var viewSpy = spyOn(followButtonView, 'render').andCallThrough();
		user.following.entities = [];
		new FollowButton(testEl, 'myEntity');
		expect(viewSpy).toHaveBeenCalledWith(testEl, 'myEntity');

	});

	it('sets the initial state if the users preferences are available', function() {
		var entity = {id: 'author1', name: 'First Author'}
		user.following.entities  = [entity];
		var button = new FollowButton(testEl, entity);
		expect(button.btn.innerText).toBe('Stop Following');
	});

	it('waits for an event users preferences are not available', function() {
		var entity = {id: 'author1', name: 'First Author'}
		user.following.entities  = [];
		var button = new FollowButton(testEl, entity);
		expect(button.btn.innerText).toBe('Start Following');
		user.following.entities  = [entity];
		event.dispatch('oFollow.ready');
		expect(button.btn.innerText).toBe('Stop Following');

	});

});

describe('Clicking the button', function() {
	it('toggles between states', function() {
		var entity = {id: 'author1', name: 'First Author'}
		user.following.entities  = [];
		var stopSpy = spyOn(user.following, 'stop');
		var startSpy = spyOn(user.following, 'start');
		var button = new FollowButton(testEl, entity);
		button.btn.click();
		expect(startSpy).toHaveBeenCalledWith(entity, 'userId');
		expect(button.btn.innerText).toBe('Stop Following');
		expect(button.btn.getAttribute('data-o-follow-state')).toBe('true');

		button.btn.click();
		expect(stopSpy).toHaveBeenCalledWith(entity, 'userId');
		expect(button.btn.innerText).toBe('Start Following');
		expect(button.btn.getAttribute('data-o-follow-state')).toBe('false');
	})
})
