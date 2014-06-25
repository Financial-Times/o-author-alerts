'use strict';

var unique = 0;

exports.get = function(url, callbackName, callback) {
	callbackName = (callbackName || 'ftJsonpCallback') + unique++;
	console.log('getting url ', url, callbackName)
	var script = document.createElement('script');
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
		};
	}
};