'use strict';

function BrowserStore(storage) {
	this.storage = storage || localStorage;
}
BrowserStore.prototype.isSupported = function() {
	if (!(this.storage && this.storage.setItem)) {
		return false;
	}
	try {
		// Try and catch quota exceeded errors
		// will fail if localStorage is undefined too
		this.storage.setItem('TestKey', '1');
		this.storage.removeItem('TestKey');
		return true;
	} catch (error) {
		return false;
	}
};
BrowserStore.prototype.get = function(key) {
	if (this.isSupported) {
		return this.storage.getItem(key);
	}
};
BrowserStore.prototype.put = function(key, value) {
	if (this.isSupported) {
		return this.storage.setItem(key, value);
	}
};
BrowserStore.prototype.remove = function(key) {
	if (this.isSupported) {
		return this.storage.removeItem(key);
	}
};
module.exports = BrowserStore;
