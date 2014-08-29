'use strict';

var views = require('./views'),
    eventHelper = require('./lib/eventHelper'),
    DomDelegate = require('ftdomdelegate'),
    oDom = require('o-dom');

function AlertsWidget() {
	this.delegate = new DomDelegate(); 
}

AlertsWidget.prototype = {

	init: function(rootEl) {
		this.delegate.root(rootEl);
		this.rootEl = rootEl;
		this.popover = views.popover(rootEl);
		this.widget = views.widget(rootEl);
		this.bindEvents();
		this.timeout = null;
	},


	destroy: function() {
		this.popover.parentElement.removeChild(this.popover);
		this.widget.parentElement.removeChild(this.widget);

		this.delegate.off();
	},

	bindEvents: function() {
		var self = this;

		this.delegate.on('click', '.o-author-alerts__widget', this.toggle.bind(this));

		document.addEventListener('click', this.hide.bind(this), false);

		this.delegate.on('keydown', '[aria-expanded]', function(e) {
			if(e.which === 27) { //esc key
				self.hide();
			}
		});
		
		// Hide when clicked on the save button
		this.delegate.on('oAuthorAlerts.saveChanges', '', function(e) {
				self.hide(null, false); //dont fire close event!
		});

		//Hide the current popover if any other layer is opened
		document.body.addEventListener('oLayers.new', function(ev) {
			if(ev.detail.el !== self.popover) {
				self.hide();
			}
		});
	},

	toggle: function() {
		if(this.rootEl.hasAttribute('aria-expanded')) {
			this.hide();
		} else {
			this.show();
		}
	},

	show: function() {
		this.rootEl.setAttribute('aria-expanded', '');
	  eventHelper.dispatch('oTracking.Event', { model: 'eventonpage', type: 'hover', data: 'followAuthor'}, window);
	  eventHelper.dispatch('oLayers.new', { el: this.popover }, document.body);
	},

	hide: function(ev, fireCloseEvent) {
		var target = ev ? ev.target : null,
			isInWidget = (target && target.className === 'o-author-alerts__icon--tick') ||
				oDom.getClosestMatch(target, '[data-o-component=o-author-alerts]');

		if(typeof fireCloseEvent === 'undefined') {
			fireCloseEvent = true; //fire the close event by default
		}
		if(!isInWidget || (!target && this.rootEl.hasAttribute('aria-expanded'))) {
			this.rootEl.removeAttribute('aria-expanded');
			if(fireCloseEvent) {
				eventHelper.dispatch('oLayers.close', { el: this.popover }, document.body);
				eventHelper.dispatch('oAuthorAlerts.widgetClose', null, this.rootEl);
			}
		}
	}
};


module.exports = AlertsWidget;