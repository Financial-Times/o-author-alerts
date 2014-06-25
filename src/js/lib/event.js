'use strict';

exports.dispatch = function(name, data, rootEl) {
	rootEl = rootEl || document.body;
  if (rootEl.dispatchEvent) {
  		var event = new CustomEvent(name, {"detail": data, bubbles: true});
      rootEl.dispatchEvent(event);
  }
}