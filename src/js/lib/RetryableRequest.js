'use strict';

var jsonp = require('./jsonp.js');
var event = require('./event.js');
var BrowserStore = require('./BrowserStore');
var storage  = new BrowserStore(localStorage);

function RetryableRequest(options) {
  options = options || {};
  this.unique = 0;
  this.name = options.name || 'oFollowRequest';
  this.retry = (options.retry === false ? false : true);
  this.maxRetries = options.maxRetries || 4;
  this.inProgress = '';
  this.queue = [];
  this.success = options.success || null;
  this.error = options.error || null;
}

RetryableRequest.prototype.init = function(options) {
  var self = this;
  return new Promise(function(resolve, reject) {

    if(self.retry) {
      self.loadQueue();
      var promises = [];
      self.queue.forEach(function(item) {
        promises.push(self.get());
      });
      Promise.all(promises).then(function(arr){
        resolve(arr[arr.length - 1]);
      });

    } else {
      self.clearQueue();
      resolve(null);
    }
  });
}

RetryableRequest.prototype.loadQueue = function() {
  var queue = storage.get(this.name + 'Cache');
  if(queue) {
    this.queue = JSON.parse(queue);
  }
}
RetryableRequest.prototype.saveQueue = function() {
  if(!this.retry) return;
  if(this.queue && this.queue.length) {
    storage.put(this.name + 'Cache', JSON.stringify(this.queue));
  } else {
    storage.delete(this.name + 'Cache');
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

  return new Promise(function(resolve, reject) {

    if(!self.inProgress && self.queue.length >= 1) {
      if(url) {
        self.inProgress = queueItem;
      } else {
        self.inProgress = self.queue[0];
      }
      jsonp.get(self.queue[0].url, (self.name + self.unique++), function(data) {
        if(typeof self.callback ==='function') {
          self.callback(data);
        }
        resolve(data);
      });
      self.queue.shift();
      self.saveQueue();

    } else {
      resolve(null);
    }
  });
}

RetryableRequest.prototype.callback = function(data) {
  if (data && data.status === 'success') {
    if(typeof this.success === 'function') {
      this.success(data);
      this.inProgress = '';
    }
  } else {
    if(typeof this.error === 'function') {
      this.error(data);
    }
    this.inProgress.tried += 1;
    if(this.retry && isRetryable(data) && this.inProgress.tried < this.maxRetries) {
      this.queue.unshift(this.inProgress);
      this.saveQueue();
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