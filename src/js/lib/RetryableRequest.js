'use strict';

var jsonp = require('./jsonp.js');
var event = require('./event.js');
var BrowserStore = require('./BrowserStore');
var storage  = new BrowserStore(localStorage);

function RetryableRequest(options) {
  options = options || {};
  this.name = options.name || 'oFollowRequest';
  this.retry = (options.retry === false ? false : true);
  this.maxRetries = options.maxRetries || 4;
  this.inProgress = '';
  this.queue = [];
  this.requestCallback = options.requestCallback || null;
  this.errorCallback = options.errorCallback || null;

  if(this.retry) {
    this.loadQueue();
  } else {
    this.clearQueue();
  }
}

RetryableRequest.prototype.loadQueue = function() {
  var queue = storage.get(this.name + 'Cache');
  if(queue) {
    this.queue = JSON.parse(queue);
    this.get();
  }
}
RetryableRequest.prototype.saveQueue = function() {
  if(this.queue && this.queue.length) {
    storage.put(this.name + 'Cache', JSON.stringify(this.queue));
  }
}

RetryableRequest.prototype.clearQueue = function() {
  this.queue = [];
  this.inProgress = '';
  storage.delete(this.name + 'Cache');
}

RetryableRequest.prototype.get = function(url) {
  var self = this;
  var queueItem = { url: url, tried: 0};
  if(url) {
    this.queue.push(queueItem);
    this.saveQueue();
  };

  if(!this.inProgress && this.queue.length >= 1) {
    if(url) {
      this.inProgress = queueItem;
    } else {
      this.inProgress = this.queue[0];
    }
    jsonp.get(this.queue[0].url, this.name, function(data) {
      if(typeof self.callback ==='function') {
        self.callback(data);
      }
    });
    this.queue.shift();
    this.saveQueue();
  }
}

RetryableRequest.prototype.callback = function(data) {
  if (data && data.status === 'success') {
    if(typeof this.requestCallback === 'function') {
      this.requestCallback(data);
    }
    this.inProgress = '';
    this.get();
    if (this.queue.length === 0) {
      this.clearQueue();
    }
    
  } else {
    if(typeof this.errorCallback === 'function') {
      this.errorCallback(data);
    }
    this.inProgress.tried += 1;
    if(this.retry && isRetryable(data) && this.inProgress.tried < this.maxRetries) {
      this.queue.unshift(this.inProgress);
      this.saveQueue();
    } else {
      this.inProgress = '';
    }
  }
}


//TODO: move this into a constructor option
function isRetryable(data) {
  //these alerts occur if the user trys to stop alerts for something it has already stopped
  //i.e. in a different tab. In this case, no need to retry 
  if(data.message && (data.message === 'user is not following this id' ||
    data.message === 'user has no following list')) {
    return false;
  }
  return true;
}


module.exports = RetryableRequest;