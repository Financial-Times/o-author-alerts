/*global require,describe,it,expect*/

const views = require('../src/js/views.js');

const container = document.createElement('div');
container.className = 'o-author-alerts';
document.body.appendChild(container);

describe('Rendering a follow button', function() {


	it('adds  name and the necessary data attributes', function() {

		const entity = {
			name: 'Arjun',
			id: 'arjunId'
		};

		views.button(container,entity);
		const buttonWrapper = container.querySelector('.o-author-alerts__entity');
		expect(buttonWrapper).toBeTruthy();
		const button = buttonWrapper.querySelector('button');
		expect(buttonWrapper.querySelector('.o-author-alerts__controls').getAttribute('data-o-author-alerts-id')).toBe('arjunId');
		expect(buttonWrapper.querySelector('.o-author-alerts__controls').getAttribute('data-o-author-alerts-name')).toBe('Arjun');
		expect(buttonWrapper.querySelector('.o-author-alerts__frequency').hasAttribute('disabled')).toBe(true);
		expect(button.innerText).toBe('Start alerts');
	});

	it('returns the wrapper created', function() {
		const entity = {
			name: 'Arjun',
			id: 'arjunId'
		};

		const returned = views.button(container,entity);
		expect(returned.className).toBe('o-author-alerts__entity');
	});


});
