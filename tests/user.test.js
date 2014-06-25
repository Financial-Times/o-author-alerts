/*global require,describe,it,expect,spyOn*/
'use strict';

var user = require('../src/js/user.js');
var oCookies = require('o-cookies');

describe('The user object', function(){
	it('contains the eRights ID of the currently logged in user', function() {
		spyOn(oCookies,'get').andReturn('blah_EID=99999_PID=blah');
		user.init();
		expect(user.id).toEqual('99999');
	});
});