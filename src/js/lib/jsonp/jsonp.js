const param = require('./param.js');
const scriptLoader = require('./scriptLoader.js');

let callbackIndex = 0;
const callbackBase = 'jsonp_' + Math.random().toString(36).substring(7);

/**
 * The actual function which does the jsonp.
 * @param  {object}   options  Several configuration options (e.g. url, data)
 * @param  {Function} callback function (err, data)
 * @return {undefined}
 */
function jsonp(options, callback) {
	let callbackName;
	let callbackIssued;
	let callbackCalled;
	let success;
	let error;

	/**
	 * Parameter validation.
	 */
	if (typeof callback !== 'function') {
		throw new Error("Callback not specified");
	}

	if (typeof options !== 'object') {
		callback(new Error("Configuration not specified or has the wrong type."));
		return;
	}

	if (!options.url) {
		callback(new Error("URL is not specified"));
		return;
	}


	callbackIssued = false;
	callbackCalled = false;

	success = function (jsonData) {
		try {
			delete window[callbackName];
		} catch (e1) {
			window[callbackName] = undefined;
		}

		if (!callbackIssued) {
			callbackIssued = true;

			callback(null, jsonData);
		}
	};

	error = function (e) {
		try {
			delete window[callbackName];
		} catch (e2) {
			window[callbackName] = undefined;
		}

		if (!callbackIssued) {
			callbackIssued = true;

			callback(e || new Error("Timeout"));
		}
	};

	callbackName = callbackBase + callbackIndex++;

	let urlDataSeparator = '?';
	if (options.url.indexOf('?') !== -1) {
		urlDataSeparator = '&';
	}

	if (options.data) {
		options.url += urlDataSeparator + param(options.data);

		options.url += '&callback=' + callbackName;
	} else {
		options.url += urlDataSeparator + 'callback=' + callbackName;
	}

	options.url += '&_=' + new Date().getTime();

	window[callbackName] = function (jsonData) {
		callbackCalled = true;

		success(jsonData);
	};

	scriptLoader(options, function (err) {
		if (err) {
			error(err);
			return;
		}

		setTimeout(function () {
			if (!callbackCalled) {
				error();
			}
		}, 50);
	});
}

module.exports = jsonp;