'use strict';

var jsonp = require('./jsonp.js');

function RetryableRequest(options) {
  options = options || {};
  this.name = options.name || 'oFollowRequest';
  this.retry = (options.retry === false ? false : true);
  this.maxRetries = options.maxRetries || 4;
}


RetryableRequest.prototype.get = function(url, callback) {
  if(typeof callback === 'function') {
    jsonp.get(url, this.name, callback);
  } else {
    jsonp.get(url, this.name);
  }
}

module.exports = RetryableRequest;