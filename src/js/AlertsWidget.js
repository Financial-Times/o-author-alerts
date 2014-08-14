'use strict';

var views = require('./views'),
    eventHelper = require('./lib/eventHelper'),
    DomDelegate = require('ftdomdelegate'),
    oDom = require('o-dom');

function AlertsWidget() {
	this.delegate = new DomDelegate(); 
}

AlertsWidget.prototype.init = function(list, rootEl) {
	this.delegate.root(rootEl);
	this.list = list;
	this.rootEl = rootEl;
	this.popover = views.popover(rootEl);
	this.widget = views.widget(rootEl);
	this.bindEvents();
	this.timeout = null;
};

AlertsWidget.prototype.destroy = function() {
	this.popover.parentElement.removeChild(this.popover);
	this.widget.parentElement.removeChild(this.widget);

	this.delegate.off();
};

AlertsWidget.prototype.bindEvents = function() {
	var self = this;
	this.delegate.on('click', '.o-author-alerts__widget', this.toggle.bind(this));
	document.addEventListener('click', this.hide.bind(this), false);


	//Hide the current popover if any other layer is opened
	document.body.addEventListener('oLayers.new', function(ev) {
		if(ev.detail.el !== self.popover) {
			self.hide();
		}
	});
};

AlertsWidget.prototype.toggle = function() {
	if(this.rootEl.hasAttribute('aria-expanded')) {
		this.hide();
	} else {
		this.show();
	}
};


AlertsWidget.prototype.show = function() {
	this.rootEl.setAttribute('aria-expanded', '');
  eventHelper.dispatch('oTracking.Event', { model: 'eventonpage', type: 'hover', data: 'followAuthor'}, window);
  eventHelper.dispatch('oLayers.new', { el: this.popover }, document.body);
};

AlertsWidget.prototype.hide = function(ev) {
	var target = ev ? ev.target : null,
		isInWidget = oDom.getClosestMatch(target, '[data-o-component=o-author-alerts]');
	if(!isInWidget || (!target && this.rootEl.hasAttribute('aria-expanded'))) {
		this.rootEl.removeAttribute('aria-expanded');
		 eventHelper.dispatch('oLayers.close', { el: this.popover }, document.body);
	}
};



module.exports = AlertsWidget;