/*global require,describe,beforeEach,afterEach,it,expect,spyOn,jasmine*/
'use strict';

var FollowWidget = require('../src/js/FollowWidget.js');
var eventHelper = require('../src/js/lib/eventHelper.js');


var rootEl, list;

describe('The widget object', function() {

	beforeEach(function() {

		rootEl = document.createElement('div');
		rootEl.setAttribute('data-o-follow-user', '');
		rootEl.className = 'o-follow';
		rootEl.innerHTML = '<ul class="o-follow__list"></ul>';
		document.body.appendChild(rootEl);
		list = rootEl.querySelector('.o-follow__list');
	});

	afterEach(function(){
		document.body.removeChild(rootEl);
	});


	it('creates all the needed html if it doesn\'t exist', function() {

		var widget = new FollowWidget();

		widget.init(list, rootEl);

		var widgetEl = rootEl.querySelector('span.o-follow__widget');
		expect(widgetEl).toBeTruthy();
		expect(widgetEl.innerText).toEqual('Alerts');
		expect(widgetEl.querySelector('i').className).toEqual('icon-arrow-down');

		var popoverEl = rootEl.querySelector('div.o-follow__popover');
		expect(popoverEl).toBeTruthy();
		expect(popoverEl.hasAttribute('will-change')).toBeTruthy();
		expect(popoverEl.querySelector('h3.o-follow__header').innerText).toEqual('Get alerts for:');
	});

	it('doesn\t recreate if it already exists', function() {

		var widget = new FollowWidget();

		widget.init(list, rootEl);
		widget.init(list, rootEl);

		var widgetEls = rootEl.querySelectorAll('span.o-follow__widget');
		expect(widgetEls.length).toEqual(1);

		var popoverEls = rootEl.querySelectorAll('div.o-follow__popover');
		expect(popoverEls.length).toEqual(1);
	});

	it('binds events', function() {
		var widget = new FollowWidget();
		var delSpy = spyOn(widget.delegate, 'on');

		widget.init(list, rootEl);
		//NOTE: phantomjs thinks it's a touch browser
		expect(delSpy).toHaveBeenCalledWith('touchstart', '.o-follow__widget', jasmine.any(Function));
		expect(delSpy).toHaveBeenCalledWith('touchend', '.o-follow__widget', jasmine.any(Function));
	});

	it('shows and hides (with a delay)', function(done) {
    jasmine.Clock.useMock();
		var widget = new FollowWidget();
		var eventSpy = spyOn(eventHelper, 'dispatch');
		widget.init(list, rootEl);
		widget.show();
		expect(rootEl.hasAttribute('aria-expanded')).toBeTruthy();;
		expect(eventSpy).toHaveBeenCalledWith('oFollow.widgetOpen', null, rootEl);


		widget.hide();
		expect(rootEl.hasAttribute('aria-expanded')).toBeTruthy();;
    jasmine.Clock.tick(501);
		expect(rootEl.hasAttribute('aria-expanded')).not.toBeTruthy();;


	});
	});