const config = require('./config.js');

function setTextContent(element, text) {
	if ('textContent' in element) {
		element.textContent = text;
	} else {
		element.innerText = text;
	}
}

function createWrapper(tagName) {
	const wrapper = document.createElement(tagName);
	wrapper.className = 'o-author-alerts__entity';
	return wrapper;
}

function createControls(entity) {
	const controls = document.createElement('span');
	controls.className = 'o-author-alerts__controls';
	if (entity) {
		controls.setAttribute('data-o-author-alerts-id', entity.id);
		controls.setAttribute('data-o-author-alerts-name', entity.name);
		if (entity.defaultFrequency) {
			controls.setAttribute('data-o-author-alerts-default-frequency', entity.defaultFrequency);
		}
	}
	return controls;
}

function createSelect() {
	const select = document.createElement('select');
	let i;
	let l;
	let option;
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
	const span = document.createElement('span');
	setTextContent(span, name);
	span.className = 'o-author-alerts__name';
	return span;
}

function createButton(text, selected) {
	const btn = document.createElement('button');
	btn.className = 'o-author-alerts__button';
	btn.setAttribute('aria-selected', (typeof selected !== 'undefined') ? selected : false);
	btn.setAttribute('title', config.get().startAlertsHoverText.replace(/\%entityType\%/g, config.get().entityType));
	btn.innerHTML = (text ? text : config.get().startAlertsText);
	return btn;
}

// Used for unsubscribe all button and Save button
exports.standaloneButton = function(list, action, text, isDisabled) {
	const tagName = list.tagName === ('UL') ? 'li' : 'div';
	const wrapper = createWrapper(tagName);
	const btn = document.createElement('button');

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
	const tagName = list.tagName === ('UL') ? 'li' : 'div';
	const wrapper = createWrapper(tagName);
	const controls = createControls(entity);

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
	let list = rootEl.querySelector('.o-author-alerts__list');

	if (!list) {
		list = document.createElement('ul');
		list.className = 'o-author-alerts__list';
		rootEl.appendChild(list);
	}
	return list;
};

exports.notice = function(rootEl, text, title) {
	let noticeWrapper = rootEl.querySelector('.o-author-alerts__notice');
	let noticeContent = rootEl.querySelector('.o-author-alerts__notice__content');
	let noticeTitle = rootEl.querySelector('.o-author-alerts__notice__title');

	if (!noticeWrapper) {
		noticeWrapper = document.createElement('div');
		noticeWrapper.className = 'o-author-alerts__notice';
		rootEl.appendChild(noticeWrapper);
	}

	if (!noticeTitle) {
		noticeTitle = document.createElement('div');
		noticeTitle.className = 'o-author-alerts__notice__title';
		setTextContent(noticeTitle, title);
		noticeWrapper.appendChild(noticeTitle);
	}

	if (!noticeContent) {
		noticeContent = document.createElement('div');
		noticeContent.className = 'o-author-alerts__notice__text';
		noticeContent.innerHTML = text;
		noticeWrapper.appendChild(noticeContent);
	}

	return noticeWrapper;
};

exports.popover = function(rootEl) {
	const list = rootEl.querySelector('.o-author-alerts__list');
	const notice = rootEl.querySelector('.o-author-alerts__notice');
	let popover = rootEl.querySelector('.o-author-alerts__popover');

	if (!popover) {
		popover = document.createElement('div');
		popover.className = 'o-author-alerts__popover';
		rootEl.insertBefore(popover, list);
		rootEl.insertBefore(notice, list);
		popover.appendChild(notice);
		popover.appendChild(list);
	}
	return popover;
};

exports.widget = function(rootEl) {
	const popover = rootEl.querySelector('.o-author-alerts__popover');
	let widget = rootEl.querySelector('.o-author-alerts__widget');
	let icon = widget ? widget.querySelector('i') : null;

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
