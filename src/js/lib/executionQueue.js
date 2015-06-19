'use strict';

var queue = [];

exports.add = function(func, args) {
	queue.push({
		func: func,
		args: args,
		_this: this
	});
	if (queue.length === 1) {
		nextInQueue();
	}

};

exports.reset = function() {
	queue = [];
};

function execute (options) {
	options.args.unshift(function () {
		queue.shift();
		nextInQueue();
	});

	options.func.call(options._this, options.args);
}

function nextInQueue() {
	if (queue.length >= 1) {
		execute.apply(null, queue[0]);
	}
}
