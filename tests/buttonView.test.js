/*global require,describe,it,expect*/
'use strict';

var views = require('../src/js/views.js');

var container = document.createElement('div');
container.className = 'o-author-alerts';
document.body.appendChild(container);

describe('Rendering a follow button', function() {


	it('creates a button group with three buttons', function() {

		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		};

		views.button(container,entity);
		var buttonWrapper = container.querySelector('.o-author-alerts__entity');
		expect(buttonWrapper).toBeTruthy();
		var buttonGroup = buttonWrapper.querySelector('.o-author-alerts__controls');
		expect(buttonGroup.getAttribute('data-o-author-alerts-id')).toBe('arjunId');
		expect(buttonGroup.getAttribute('data-o-author-alerts-name')).toBe('Arjun');

		var buttons = buttonGroup.querySelectorAll('.o-author-alerts__button');
		expect(buttons.length).toBe(3);
		expect(buttons[0].textContent).toBe('Off');
		expect(buttons[0].getAttribute('aria-selected')).toBe('true');
		expect(buttons[1].textContent).toBe('Daily');
		expect(buttons[2].textContent).toBe('Immediate');
	});


});
