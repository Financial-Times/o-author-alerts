'use strict';

var jsonp = require('./jsonp/jsonp.js');

var queue = [];

exports.add = function(options, callback) {
	queue.push(arguments);
	if (queue.length === 1) {
		nextInQueue();
	}

};

exports.reset = function() {
	queue = [];
};

function call (options, callback) {
	jsonp(options, function (err, data) {
		callback(err, data);

		queue.shift();
		nextInQueue();
	});
}

function nextInQueue() {
	if (queue.length >= 1) {
		call.apply(null, queue[0]);
	}
}
