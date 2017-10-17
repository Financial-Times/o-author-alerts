/*global require,describe,beforeEach,afterEach,it,expect,spyOn*/
const buttons = require('../src/js/buttons.js');
const views = require('../src/js/views.js');
const jsonp = require('../src/js/lib/jsonp/jsonp.js');
const eventHelper = require('../src/js/lib/eventHelper.js');
const user = require('../src/js/user.js');

let testEl;

describe('Initialising a button', function () {

	beforeEach(function () {
		spyOn(jsonp, 'get');
		user.init();
		user.id = 'userId';
		testEl = document.createElement('div');
		testEl.id = 'testEl';
		document.body.appendChild(testEl);

	});

	afterEach(function () {
		document.body.removeChild(testEl);
	});

	it('sets the initial state assuming that the user is initialised', function () {
		const entity = {
			id: 'author1',
			name: 'First Author'
		};
		views.button(testEl, entity);
		user.subscription.entities = [entity];
		buttons.init(testEl);
		const updateSpy = spyOn(user.subscription, 'update');
		const controls = testEl.querySelector('[data-o-author-alerts-id]');
		const button = controls.querySelector('button');
		const select = controls.querySelector('select');
		expect(button.innerText).toBe('Alerting');

		expect(updateSpy).not.toHaveBeenCalled();

		expect(controls.getAttribute('data-o-author-alerts-state')).toEqual('daily');

		expect(select.hasAttribute('disabled')).not.toBeTruthy();

	});

});

describe('Clicking the button', function () {

	beforeEach(function () {
		spyOn(jsonp, 'get');
		user.destroy();
		user.init();
		user.id = 'userId';
		testEl = document.createElement('div');
		testEl.id = 'testEl';
		document.body.appendChild(testEl);

	});

	afterEach(function () {
		document.body.removeChild(testEl);
	});

	it('toggles between states', function () {
		const entity = {
			id: 'author1',
			name: 'First Author'
		};
		views.button(testEl, entity);
		views.standaloneButton(testEl, 'save', 'Save', true); //Disabled save button by default

		user.subscription.entities = [];
		const updateSpy = spyOn(user.subscription, 'update');
		const eventSpy = spyOn(eventHelper, 'dispatch');

		buttons.init(testEl);

		const button = testEl.querySelector('.o-author-alerts__controls button');
		const select = testEl.querySelector('[data-o-author-alerts-id] select');
		const save = testEl.querySelector('[data-o-author-alerts-action="save"]');


		//Frequency dropdown will be disabled
		expect(select.hasAttribute('disabled')).toBeTruthy();
		expect(save.disabled).toBeTruthy();

		button.click();
		expect(save.disabled).not.toBeTruthy();
		expect(updateSpy).not.toHaveBeenCalled(); //update wont go through immediately
		expect(button.parentElement.getAttribute('data-o-author-alerts-state')).toBe('off'); //saved state remains as off


		//Frequency dropdown will now be enabled
		expect(select.hasAttribute('disabled')).not.toBeTruthy();

		save.click();
		expect(button.parentElement.getAttribute('data-o-author-alerts-state')).toBe('daily'); //saved state updates

		expect(updateSpy).toHaveBeenCalledWith(entity, 'daily'); //update goes through

		expect(eventSpy).toHaveBeenCalledWith('oTracking.Event', {
			model: 'followme',
			type: 'follow',
			value: 'First Author'
		}, window);

		button.click();
		expect(button.parentElement.getAttribute('data-o-author-alerts-state')).toBe('daily');

		save.click();
		expect(button.parentElement.getAttribute('data-o-author-alerts-state')).toBe('off'); //saved state updates


		//Frequency dropdown will now be disabled again
		expect(select.hasAttribute('disabled')).toBeTruthy();

		expect(eventSpy).toHaveBeenCalledWith('oTracking.Event', {
			model: 'followme',
			type: 'unfollow',
			value: 'First Author'
		}, window);
	});
});