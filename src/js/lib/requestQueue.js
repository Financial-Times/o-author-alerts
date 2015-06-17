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
		setTimeout(function () {
			callback(err, data, function () {
				queue.shift();
				nextInQueue();
			});
		}, 0);
	});
}

function nextInQueue() {
	if (queue.length >= 1) {
		call.apply(null, queue[0]);
	}
}
