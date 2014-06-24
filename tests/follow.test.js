var follow = require('../src/js/lib/follow'),
		jsonp =  require('../src/js/lib/jsonp.js');


describe('Follow.js', function() {
	it('a user can follow an author', function() {
		var callback = function() {}
		var getSpy = spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		}
		follow.start(entity, 'userId');
		var expectedUrl = 'http://personalisation.ft.com/follow/update?userId=' + 
			'userId&type=authors&name=Arjun&id=arjunId';

		expect(getSpy).toHaveBeenCalledWith(expectedUrl,'oFollowPersonalisationCallback');
	});

	it('a user can unfollow an author', function() {
		var callback = function() {}
		var getSpy = spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		}
		follow.stop(entity, 'userId');
		var expectedUrl = 'http://personalisation.ft.com/follow/stopFollowing?userId=' + 
			'userId&type=authors&id=arjunId';

		expect(getSpy).toHaveBeenCalledWith(expectedUrl,'oFollowPersonalisationCallback');
	});
});