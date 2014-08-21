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
	wrapper.className = 'o-author-alerts__entity';
	return wrapper;
}

function createControls(entity) {
  var controls = document.createElement('span');
  controls.className = 'o-author-alerts__controls';
  if(entity) {
    controls.setAttribute('data-o-author-alerts-id', entity.id);
    controls.setAttribute('data-o-author-alerts-name', entity.name);
  }
  return controls;
}

function createNameSpan(name){
 	var span = document.createElement('span');
  setTextContent(span, name);
  span.className = 'o-author-alerts__name';
  return span;
}

function createButton(text, selected) {
	var btn = document.createElement('button');
  btn.className = 'o-author-alerts__button';
  btn.setAttribute('aria-selected', (typeof selected !== 'undefined') ? selected : false);
  btn.setAttribute('title', 'Click to start alerts for this ' + config.entityType);
  btn.innerHTML = (text ? text : config.startAlertsText);
  return btn;
}

exports.unsubscribeAll = function(list) {
  var tagName = list.tagName === ('UL') ? 'li' : 'div';
  var wrapper = createWrapper(tagName);
  var btn = document.createElement('button');
  btn.className = 'o-author-alerts__button o-author-alerts__button--standout';
  btn.setAttribute('data-o-author-alerts-all', "unsubscribe");
  setTextContent(btn, 'Unsubscribe All');
  wrapper.appendChild(btn);
  list.appendChild(wrapper);
  return btn;
};

exports.button = function(list, entity) {
	var tagName = list.tagName === ('UL') ? 'li' : 'div';
	var wrapper = createWrapper(tagName);
  var controls = createControls(entity);

  if(config.displayName) {
    wrapper.appendChild(createNameSpan(config.displayName.replace(/\%entityName\%/g, entity.name)));
  }
  controls.appendChild(createButton());
  wrapper.appendChild(controls);
	list.appendChild(wrapper);
	return wrapper;
};

exports.list = function(rootEl) {
  var list = rootEl.querySelector('.o-author-alerts__list');

  if(!list) {
    list = document.createElement('ul');
    list.className = 'o-author-alerts__list';
    rootEl.appendChild(list);
  }
  return list;
};

exports.popover = function(rootEl) {
	var list = rootEl.querySelector('.o-author-alerts__list'),
  		popover = rootEl.querySelector('.o-author-alerts__popover');

  if(!popover) {
  	popover = document.createElement('div');
  	popover.className = 'o-author-alerts__popover';
    popover.setAttribute('will-change', '');
    if(config.popoverHeadingText) {
    	popover.innerHTML = '<h3 class="o-author-alerts__header">' + config.popoverHeadingText + '</h3>';
    }
  	rootEl.insertBefore(popover, list);
  	popover.appendChild(list);
  }

  return popover;
};

exports.widget = function(rootEl) {
	var popover = rootEl.querySelector('.o-author-alerts__popover'),
  		widget = rootEl.querySelector('.o-author-alerts__widget'),
			icon = widget ? widget.querySelector('i') : null;
  if(!widget) {
    widget = document.createElement('button');
    setTextContent(widget, config.widgetText);
    widget.className = 'o-author-alerts__widget';
    rootEl.insertBefore(widget, popover);
  }

  if(!icon) {
    icon = document.createElement('i');
    widget.appendChild(icon);
  }

  return widget;
};