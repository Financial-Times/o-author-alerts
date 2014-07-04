'use strict';

var views = require('./views'),
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
	var isTouch = ('ontouchstart' in window || 'onmsgesturechange' in window);
	if(isTouch) {
		this.delegate.on('touchstart', '.o-follow__widget', this.show.bind(this));
		this.delegate.on('touchend', '.o-follow__widget', this.hide.bind(this));
	} else {
		this.delegate.on('mouseover', '.o-follow__popover, .o-follow__widget', this.show.bind(this));
		this.delegate.on('mouseout', '.o-follow__popover, .o-follow__widget', this.hide.bind(this));
	}
};

FollowWidget.prototype.mouseover = function() {
	clearTimeout(this.timeout);
};

FollowWidget.prototype.show = function() {
	this.mouseover();
	this.rootEl.classList.add('open');
};

FollowWidget.prototype.hide = function() {
	var self = this;
	this.timeout = setTimeout(function() {
  	self.rootEl.classList.remove('open');
	}, 500);
};

module.exports = FollowWidget;