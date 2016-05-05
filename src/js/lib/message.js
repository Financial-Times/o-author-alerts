function create(rootEl, message, type) {
	let msg;
	let list;

	if (!hasMessage(rootEl)) {
		list = rootEl.querySelector('.o-author-alerts__list');
		msg = document.createElement('span');
		msg.className = 'o-author-alerts__message';
		if (list) {
			list.parentElement.insertBefore(msg, list);
		}
	}
	msg.appendChild(document.createTextNode(message));
	rootEl.setAttribute('data-o-author-alerts-message', type);
}

function remove(rootEl) {
	const msg = rootEl.querySelector('.o-author-alerts__message');
	if (msg) {
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
