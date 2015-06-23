"use strict";

exports.encode = function (value) {
	if (value) {
		return value.replace(/\=/g, '_');
	} else {
		return null;
	}
};

exports.decode = function (value) {
	if (value) {
		return value.replace(/\_/g, '=');
	} else {
		return null;
	}
};
