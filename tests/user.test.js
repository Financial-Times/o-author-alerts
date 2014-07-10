/*global require,describe,it,expect,spyOn*/
'use strict';

var user = require('../src/js/user.js');
var oCookies = require('o-cookies');

describe('The user object', function(){
	it('contains the eRights ID of the currently logged in user', function() {
		user.destroy();
		spyOn(oCookies,'getParam').andReturn('99999');
		user.init();
		expect(user.id).toEqual('99999');
	});
});