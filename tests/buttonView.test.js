/*global require,describe,it,expect*/
'use strict';

var views = require('../src/js/views.js');

var container = document.createElement('div');
container.className = 'o-author-alerts';
document.body.appendChild(container);

describe('Rendering a follow button', function() {


	it('adds  name and the necessary data attributes', function() {

		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		};

		views.button(container,entity);
		var buttonWrapper = container.querySelector('.o-author-alerts__entity');
		expect(buttonWrapper).toBeTruthy();
		expect(buttonWrapper.querySelector('.o-author-alerts__name').innerText).toEqual('Arjun');
		var button = buttonWrapper.querySelector('button');
		expect(button.getAttribute('data-o-author-alerts-id')).toBe('arjunId');
		expect(button.getAttribute('data-o-author-alerts-name')).toBe('Arjun');
		expect(button.innerText).toBe('Start Alerts');
	});

	it('returns the wrapper created', function() {
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		};
		
		var returned = views.button(container,entity);
		expect(returned.className).toBe('o-author-alerts__entity');
	});


});
