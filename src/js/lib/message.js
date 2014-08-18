'use strict';

function create(rootEl, message, type) {
	var msg, list;
  if(!hasMessage(rootEl)) {
  	list = rootEl.querySelector('.o-author-alerts__list');
    msg = document.createElement('span');
    msg.className = 'o-author-alerts__message';
    if(list) {
    	list.parentElement.insertBefore(msg, list);
    }
  }
  msg.innerText = message;
  rootEl.setAttribute('data-o-author-alerts-message', type);
}

function remove(rootEl) {
	var msg = rootEl.querySelector('.o-author-alerts__message');
  if(msg) {
    msg.parentElement.removeChild(msg);
  }
  rootEl.removeAttribute('data-o-author-alerts-message');
}

function hasMessage(rootEl) {
	return rootEl.hasAttribute('data-o-author-alerts-message');
}

module.exports = {
	create: create,
	remove: remove
};