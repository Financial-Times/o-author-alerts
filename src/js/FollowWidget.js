function FollowWidget(list) {
	this.list = list;
	this.popover = createPopover(list);
	this.widget = createWidget(this.popover);
	this.bindEvents();
	this.timeout = null;
}

function createPopover(list) {
	var parent = list.parentElement;
  var popover = parent.querySelector('.o-follow__popover');
  var header = parent.getAttribute('data-o-follow-header') || 'Get alerts for:';
  if(!popover) {
  	popover = document.createElement('div');
  	popover.className = 'o-follow__popover';
  	popover.innerHTML = '<h3 class="o-follow__header">' + header + '</div>';
  	parent.insertBefore(popover, list);
  	popover.appendChild(list);
  }
  return popover;
}


function createWidget(popover) {
	var parent = popover.parentElement;
	var text = parent.getAttribute('data-o-follow-widget') || 'Alerts';
  var widget = parent.querySelector('.o-follow__widget');
  var i;
  if(!widget) {
    widget = document.createElement('a');
    widget.href = '';
    widget.innerText = text;
    widget.classList.add('o-follow__widget');
    parent.insertBefore(widget, popover);
  }
  i=widget.querySelector('i');
  if(!i) {
    i = document.createElement('i');
    i.className = 'icon-arrow-down';
    widget.appendChild(i);
  }
  return widget;
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