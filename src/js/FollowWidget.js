function FollowWidget(overlay) {
	this.overlay = overlay;
	this.widget = createWidget(overlay);
	this.bindEvents();
	this.timeout = null;
}


function createWidget(overlay) {
	var parent = overlay.parentElement;
	var text = parent.getAttribute('data-o-follow-widget') || 'Alerts';
  var widget = parent.querySelector('.o-follow__widget');
  var i;
  if(!widget) {
    widget = document.createElement('a');
    i = document.createElement('i');
    i.className = 'icon-arrow-down';
    widget.href = '';
    widget.innerText = text;
    widget.classList.add('o-follow__widget');
    widget.appendChild(i);
    parent.insertBefore(widget, overlay);
  }
  return widget;
}

FollowWidget.prototype.bindEvents = function() {
	this.widget.addEventListener('mouseover', this.show.bind(this));
	this.widget.addEventListener('mouseout', this.hide.bind(this));
	this.overlay.addEventListener('mouseover', this.mouseover.bind(this));
	this.overlay.addEventListener('mouseout', this.hide.bind(this));
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
  	self.widget.parentElement.classList.remove('open')
	}, 500);
};

module.exports = FollowWidget;