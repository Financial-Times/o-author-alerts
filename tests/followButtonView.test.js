var followButtonView = require('../src/js/followButtonView.js');

describe('Rendering a follow button', function() {


	it('adds  name and the necessary data attributes', function() {

		var container = document.body;
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		}
		followButtonView.render(container,entity);
		var buttonWrapper = container.querySelector('.o-follow__entity');
		expect(buttonWrapper).toBeTruthy();
		expect(buttonWrapper.querySelector('.o-follow__name').innerText).toEqual('Arjun');
		var button = buttonWrapper.querySelector('button');
		expect(button.getAttribute('data-o-follow-id')).toBe('arjunId');
		expect(button.getAttribute('data-o-follow-name')).toBe('Arjun');
		expect(button.innerText).toBe('Start Following');
	});

	it('returns the wrapper created', function() {
		var container = document.body;
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		}
		var returned = followButtonView.render(container,entity);
		expect(returned.className).toBe('o-follow__entity');
	})


})
