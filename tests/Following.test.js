var Following = require('../src/js/Following'),
		jsonp =  require('../src/js/lib/jsonp.js');


describe('Following', function() {


	it('get() makes a call to fetch the latest following data for a user', function() {
		var getSpy = spyOn(jsonp, 'get');
		var following = new Following('testUser');
		following.get();
		var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=testUser';
		expect(getSpy).toHaveBeenCalledWith(url, 'oFollowGetCallback', jasmine.any(Function));
	})

	it('set() updates the model based on the data recieved', function() {

		var following = new Following();
		var data = {"status":"success", "taxonomies":[{"id":"Q0ItMDAwMDcxOA==-QXV0aG9ycw==","name":"Jack Farchy","type":"authors"}]};
		following.set(data);
		expect(following.entities[0]).toBe(data.taxonomies[0]);
		expect(following.online).toBeTruthy();
	});


	it('set() only works if the data is correct', function() {
		var following = new Following();
		var data = {"blah":[{"id":"Q0ItMDAwMDcxOA==-QXV0aG9ycw==","name":"Jack Farchy","type":"authors"}]};
		following.set(data);
		expect(following.entities.length).toBe(0);
		expect(following.online).not.toBeTruthy();
	});


	it('a user can follow an author', function() {
		var callback = function() {}
		var getSpy = spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		}
		var following = new Following();

		following.start(entity, 'userId');
		var expectedUrl = 'http://personalisation.ft.com/follow/update?userId=' + 
			'userId&type=authors&name=Arjun&id=arjunId';

		expect(getSpy).toHaveBeenCalledWith(expectedUrl,'oFollowStartCallback');
		// expect(following.entities.hasOwnProperty('arjunId')).toBe(true);
	});

	it('a user can unfollow an author', function() {
		var callback = function() {}
		var getSpy = spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		}
		var following = new Following();

		following.stop(entity, 'userId');
		var expectedUrl = 'http://personalisation.ft.com/follow/stopFollowing?userId=' + 
			'userId&type=authors&id=arjunId';

		expect(getSpy).toHaveBeenCalledWith(expectedUrl,'oFollowStopCallback');
	});
});