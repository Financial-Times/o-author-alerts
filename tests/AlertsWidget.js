/*global require,describe,beforeEach,afterEach,it,expect,spyOn,jasmine*/

const AlertsWidget = require('../src/js/AlertsWidget.js');
const eventHelper = require('../src/js/lib/eventHelper.js');


let rootEl;
let list;

describe('The widget object', function() {

	beforeEach(function() {
		rootEl = document.createElement('div');
		rootEl.setAttribute('data-o-author-alerts-user', '');
		rootEl.className = 'o-author-alerts';
		rootEl.innerHTML = '<ul class="o-author-alerts__list"></ul>';
		document.body.appendChild(rootEl);
		list = rootEl.querySelector('.o-author-alerts__list');
	});

	afterEach(function(){
		document.body.removeChild(rootEl);
	});


	it('creates all the needed html if it doesn\'t exist', function() {

		const widget = new AlertsWidget();

		widget.init(list, rootEl);

		const widgetEl = rootEl.querySelector('span.o-author-alerts__widget');
		expect(widgetEl).toBeTruthy();
		expect(widgetEl.innerText).toEqual('Author Alerts');
		expect(widgetEl.querySelector('i').className).toEqual('icon-arrow-down');

		const popoverEl = rootEl.querySelector('div.o-author-alerts__popover');
		expect(popoverEl).toBeTruthy();
		expect(popoverEl.hasAttribute('will-change')).toBeTruthy();
	});

	it('doesn\t recreate if it already exists', function() {

		const widget = new AlertsWidget();

		widget.init(list, rootEl);
		widget.init(list, rootEl);

		const widgetEls = rootEl.querySelectorAll('span.o-author-alerts__widget');
		expect(widgetEls.length).toEqual(1);

		const popoverEls = rootEl.querySelectorAll('div.o-author-alerts__popover');
		expect(popoverEls.length).toEqual(1);
	});

	it('binds events', function() {
		const widget = new AlertsWidget();
		const delSpy = spyOn(widget.delegate, 'on');

		widget.init(list, rootEl);
		//NOTE: phantomjs thinks it's a touch browser
		expect(delSpy).toHaveBeenCalledWith('click', '.o-author-alerts__widget', jasmine.any(Function));
	});

	it('shows and hides (with a delay)', function() {
		jasmine.Clock.useMock();
		const widget = new AlertsWidget();
		const eventSpy = spyOn(eventHelper, 'dispatch');
		widget.init(list, rootEl);
		widget.show();
		expect(rootEl.hasAttribute('aria-expanded')).toBeTruthy();
		expect(eventSpy).toHaveBeenCalledWith('oTracking.Event', {
			model: 'eventonpage', type: 'hover', data: 'followAuthor'
		}, window);

		widget.hide();
		expect(rootEl.hasAttribute('aria-expanded')).not.toBeTruthy();

	});
});
