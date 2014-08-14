'use strict';

var unique = 0;
var queue = [];

exports.get = function(url, callbackName, callback) {
	
	queue.push(arguments);
	if(queue.length === 1) {
		nextInQueue();
	}

};

exports.reset = function() {
	unique = 0;
	queue = [];
}

function addScript(url, callbackName, callback) {
	var script = document.createElement('script');
	callbackName = (callbackName || 'oAlertsJsonpCallback') + unique++;
  script.type = 'text/javascript';
	if(url.indexOf('?') > 0) {
		url = url + '&callback=' + callbackName;
	} else {
		url = url + '?callback=' + callbackName;
	}
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);

	if(!window[callbackName]) {
		window[callbackName] = function(data) {
			if(typeof callback === 'function') {
				callback(data);
			}
	    document.getElementsByTagName('head')[0].removeChild(script);
			script = null;
			delete window[callbackName];
			queue.shift();
			nextInQueue();
		}
	}
}

function nextInQueue() {
	if(queue.length >= 1) {
		addScript.apply(this, queue[0]);
	}
}