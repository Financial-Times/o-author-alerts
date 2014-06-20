
var unique = 0;

exports.get = function(url, callbackName, callback) {
	callbackName = (callbackName || 'ftJsonpCallback') + unique++;

	var script = document.createElement('script');
  script.type = 'text/javascript';
	script.src = url + '&callback=' + callbackName;
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