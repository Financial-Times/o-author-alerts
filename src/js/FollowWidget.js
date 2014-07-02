var views = require('./views');

function FollowWidget(list) {
  var rootEl = list.parentElement;
	this.list = list;
	this.popover = views.popover(rootEl);
	this.widget = views.widget(rootEl);
	this.bindEvents();
	this.timeout = null;
}

FollowWidget.prototype.bindEvents = function() {
	this.widget.addEventListener('mouseover', this.show.bind(this));
	this.widget.addEventListener('mouseout', this.hide.bind(this));
	this.popover.addEventListener('mouseover', this.mouseover.bind(this));
	this.popover.addEventListener('mouseout', this.hide.bind(this));
};

FollowWidget.prototype.mouseover = function() {
	clearTimeout(this.timeout);
};

FollowWidget.prototype.show = function() {
	this.mouseover();
	this.widget.parentElement.classList.add('open');
};

FollowWidget.prototype.hide = function() {
	var self = this;
	this.timeout = setTimeout(function() {
  	self.widget.parentElement.classList.remove('open');
	}, 500);
};

module.exports = FollowWidget;