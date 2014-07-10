'use strict';

function createWrapper(tagName) {
	var wrapper = document.createElement(tagName);
	wrapper.className = 'o-follow__entity';
	return wrapper;
}

function createNameSpan(name){
 	var span = document.createElement('span');
  span.innerText = name;
  span.className = 'o-follow__name';
  return span;
}

function createButton(entity) {
	var btn = document.createElement('button');
  btn.className = 'o-follow__button';
  btn.setAttribute('data-o-follow-id', entity.id);
  btn.setAttribute('data-o-follow-name', entity.name);
  btn.innerText = 'Start';
  return btn;
}

exports.button = function(list, entity) {
	var tagName = list.tagName === ('UL') ? 'li' : 'div';
	var wrapper = createWrapper(tagName);
	wrapper.appendChild(createNameSpan(entity.name));
	wrapper.appendChild(createButton(entity));
	list.appendChild(wrapper);
	return wrapper;
};

exports.list = function(rootEl) {
  var list = rootEl.querySelector('.o-follow__list');
  if(!list) {
    list = document.createElement('ul');
    list.className = 'o-follow__list';
    rootEl.appendChild(list);
  }
  return list;
};

exports.popover = function(rootEl) {
	var list = rootEl.querySelector('.o-follow__list'),
  		popover = rootEl.querySelector('.o-follow__popover'),
  		header = rootEl.getAttribute('data-o-follow-header') || 'Get alerts for:';

  if(!popover) {
  	popover = document.createElement('div');
  	popover.className = 'o-follow__popover';
    popover.setAttribute('will-change', '');
  	popover.innerHTML = '<h3 class="o-follow__header">' + header + '</div>';
  	rootEl.insertBefore(popover, list);
  	popover.appendChild(list);
  }

  return popover;
};

exports.widget = function(rootEl) {
	var popover = rootEl.querySelector('.o-follow__popover'),
  		widget = rootEl.querySelector('.o-follow__widget'),
			icon = widget ? widget.querySelector('i') : null;
  if(!widget) {
    widget = document.createElement('span');
    widget.innerText = "Alerts";
    widget.className = 'o-follow__widget';
    rootEl.insertBefore(widget, popover);
  }

  if(!icon) {
    icon = document.createElement('i');
    icon.className = 'icon-arrow-down';
    widget.appendChild(icon);
  }

  return widget;
};