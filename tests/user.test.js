/*global require,describe,it,expect,spyOn*/
'use strict';

var user = require('../src/js/user.js');
var jsonp = require('../src/js/lib/jsonp.js');
var oCookies = require('o-cookies');

describe('The user object', function(){

	it('doesn\'t fetch following data if there is no valid user id', function() {
		user.destroy();
		spyOn(oCookies,'getParam').andReturn(undefined);
		spyOn(jsonp, 'get');
		user.init();
		expect(user.id).toBeUndefined();
		expect(jsonp.get).not.toHaveBeenCalled();
	});

	it('contains the eRights ID of the currently logged in user', function() {
		user.destroy();
		spyOn(oCookies,'getParam').andReturn('99999');
		spyOn(jsonp, 'get');
		user.init();
		expect(user.id).toEqual('99999');
		expect(jsonp.get).toHaveBeenCalled();
		expect(user.following).toBeTruthy();
	});


});