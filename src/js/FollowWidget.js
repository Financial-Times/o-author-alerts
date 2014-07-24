'use strict';

var views = require('./views'),
    eventHelper = require('./lib/eventHelper'),
    DomDelegate = require('ftdomdelegate');

function FollowWidget() {
	this.delegate = new DomDelegate(); 
}

FollowWidget.prototype.init = function(list, rootEl) {
	this.delegate.root(rootEl);
	this.list = list;
	this.rootEl = rootEl;
	this.popover = views.popover(rootEl);
	this.widget = views.widget(rootEl);
	this.bindEvents();
	this.timeout = null;
};

FollowWidget.prototype.destroy = function() {
	this.popover.parentElement.removeChild(this.popover);
	this.widget.parentElement.removeChild(this.widget);

	this.delegate.off();
};

FollowWidget.prototype.bindEvents = function() {
	var isTouch = ('ontouchstart' in window),
			self = this;
	if(isTouch) {
		this.delegate.on('touchstart', '.o-follow__widget', this.show.bind(this));
		this.delegate.on('touchend', '.o-follow__widget', this.hide.bind(this));
	} else {
		this.delegate.on('mouseover', '.o-follow__popover, .o-follow__widget', this.show.bind(this));
		this.delegate.on('mouseout', '.o-follow__popover, .o-follow__widget', this.mouseout.bind(this));
	}

	//Hide the current popover if any other layer is opened
	document.body.addEventListener('oLayers.new', function(ev) {
		if(ev.detail.el !== self.popover) {
			self.hide();
		}
	});

};

FollowWidget.prototype.mouseover = function() {
	//used to stop flicker when moving mouse between widget and popover
	clearTimeout(this.timeout);
};

FollowWidget.prototype.mouseout = function() {
	this.timeout = setTimeout(this.hide.bind(this), 500);
};

FollowWidget.prototype.show = function() {
	this.mouseover();
	this.rootEl.setAttribute('aria-expanded', '');
  eventHelper.dispatch('oTracking.Event', { model: 'oFollow', type: 'widgetOpen'}, window);
  eventHelper.dispatch('oLayers.new', { el: this.popover }, document.body);
};


FollowWidget.prototype.hide = function() {
  this.rootEl.removeAttribute('aria-expanded');
  eventHelper.dispatch('oLayers.close', { el: this.popover }, document.body);
};



module.exports = FollowWidget;