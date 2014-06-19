

exports.get = function(url, callback, callbackName) {
		callbackName = callbackName || 'ftJsonpCallback' + unique++;

		var script = document.createElement('script');
	  script.type = 'text/javascript';
		script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);

		if(!window[callbackName]) {
			window[callbackName] = function() {
				if(typeof callback === 'function') {
					callback();
				}
				
	      document.getElementsByTagName('head')[0].removeChild(script);
				script = null;
				delete window[callbackName];
			};
		}
	};