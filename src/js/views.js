'use strict';

var config = require('./config.js');

function setTextContent(element, text) {
	if ('textContent' in element) {
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
	if (entity) {
		controls.setAttribute('data-o-author-alerts-id', entity.id);
		controls.setAttribute('data-o-author-alerts-name', entity.name);
	}
	return controls;
}

function createSelect() {
	var select = document.createElement('select');
	var i;
	var l;
	var option;
	select.disabled = true;
	select.className = 'o-author-alerts__frequency';
	for (i=0,l=config.get().frequencies.length;i<l;i++) {
		option = document.createElement('option');
		option.value = config.get().frequencies[i].key;
		setTextContent(option, config.get().frequencies[i].text);
		select.appendChild(option);
	}
	return select;
}
function createNameSpan(name){
	var span = document.createElement('span');
	setTextContent(span, name);
	span.className = 'o-author-alerts__name';
	return span;
}

function createButton(text, selected, title) {
	var btn = document.createElement('button');
	btn.className = 'o-author-alerts__button';
	btn.setAttribute('aria-selected', (typeof selected !== 'undefined') ? selected : false);
	btn.setAttribute('title', 'Click to start alerts for this ' + config.get().entityType);
	btn.innerHTML = (text ? text : config.get().startAlertsText);
	return btn;
}

// Used for unsubscribe all button and Save button
exports.standaloneButton = function(list, action, text, isDisabled) {
	var tagName = list.tagName === ('UL') ? 'li' : 'div';
	var wrapper = createWrapper(tagName);
	var btn = document.createElement('button');
	btn.className = 'o-author-alerts__button o-author-alerts__button--standout';
	btn.setAttribute('data-o-author-alerts-action', action);
	if (isDisabled && isDisabled === true) {
		btn.setAttribute('disabled', '');
	}
	setTextContent(btn, text);
	wrapper.appendChild(btn);
	list.appendChild(wrapper);
	return btn;
};

// Used for the author toggle button
exports.button = function(list, entity) {
	var tagName = list.tagName === ('UL') ? 'li' : 'div';
	var wrapper = createWrapper(tagName);
	var controls = createControls(entity);

	if (config.get().displayName) {
		wrapper.appendChild(createNameSpan(config.get().displayName.replace(/\%entityName\%/g, entity.name)));
	}
	controls.appendChild(createButton());
	controls.appendChild(createSelect());
	wrapper.appendChild(controls);
	list.appendChild(wrapper);
	return wrapper;
};

exports.list = function(rootEl) {
	var list = rootEl.querySelector('.o-author-alerts__list');

	if (!list) {
		list = document.createElement('ul');
		list.className = 'o-author-alerts__list';
		rootEl.appendChild(list);
	}
	return list;
};

exports.popover = function(rootEl) {
	var list = rootEl.querySelector('.o-author-alerts__list');
	var popover = rootEl.querySelector('.o-author-alerts__popover');

	if (!popover) {
		popover = document.createElement('div');
		popover.className = 'o-author-alerts__popover';
		rootEl.insertBefore(popover, list);
		popover.appendChild(list);
	}

	return popover;
};

exports.widget = function(rootEl) {
	var popover = rootEl.querySelector('.o-author-alerts__popover');
	var widget = rootEl.querySelector('.o-author-alerts__widget');
	var icon = widget ? widget.querySelector('i') : null;

	if (!widget) {
		widget = document.createElement('button');
		setTextContent(widget, config.get().widgetText);
		widget.className = 'o-author-alerts__widget';
		rootEl.insertBefore(widget, popover);
	}

	if (!icon) {
		icon = document.createElement('i');
		widget.appendChild(icon);
	}

	return widget;
};
