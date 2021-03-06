exports.dispatch = function (name, data, rootEl) {
	rootEl = rootEl || document.body;
	if (document.createEvent && rootEl.dispatchEvent) {
		const event = document.createEvent('Event');
		event.initEvent(name, true, true);
		if (data) {
			event.detail = data;
		}
		rootEl.dispatchEvent(event);
	}
};