'use strict';

var config = require('./config.js');

function setTextContent(element, text) {
  if('textContent' in element) {
    element.textContent = text;
  } else {
    element.innerText = text;
  }
}

function createWrapper(tagName) {
	var wrapper = document.createElement(tagName);
	wrapper.className = 'o-follow__entity';
	return wrapper;
}

function createNameSpan(name){
 	var span = document.createElement('span');
  setTextContent(span, name);
  span.className = 'o-follow__name';
  return span;
}

function createButton(entity) {
	var btn = document.createElement('button');
  btn.className = 'o-follow__button';
  btn.setAttribute('data-o-follow-id', entity.id);
  btn.setAttribute('data-o-follow-name', entity.name);
  setTextContent(btn, config.startFollowingText);
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
  		header = config.popoverHeadingText;

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
    console.log('config', config);
    setTextContent(widget, config.widgetText);
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