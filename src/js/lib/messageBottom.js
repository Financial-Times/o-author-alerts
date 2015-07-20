'use strict';

function create(rootEl, message, type) {
	var msg, list;
	if(!hasMessage(rootEl)) {
		list = rootEl.querySelector('.o-author-alerts__list');
		msg = document.createElement('span');
		msg.className = 'o-author-alerts__message-bottom';
		if(list) {
			list.parentElement.appendChild(msg);
		}
	}
	msg.appendChild(document.createTextNode(message));
	rootEl.setAttribute('data-o-author-alerts-message-bottom', type);
}

function remove(rootEl) {
	var msg = rootEl.querySelector('.o-author-alerts__message-bottom');
	if(msg) {
		msg.parentElement.removeChild(msg);
	}
	rootEl.removeAttribute('data-o-author-alerts-message-bottom');
}

function hasMessage(rootEl) {
	return rootEl.hasAttribute('data-o-author-alerts-message-bottom');
}

module.exports = {
	create: create,
	remove: remove
};
