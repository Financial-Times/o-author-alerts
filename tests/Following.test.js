var Following = require('../src/js/Following'),
		jsonp =  require('../src/js/lib/jsonp.js');

var following;

beforeEach(function() {
	following = new Following('userId');
});

describe('Getting the initial model', function() {


	it('get() makes a call to fetch the latest following data for a user', function() {
		var getSpy = spyOn(jsonp, 'get');
		following.get();
		var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=userId';
		expect(getSpy).toHaveBeenCalledWith(url, 'oFollowGetCallback', jasmine.any(Function));
	})

	it('set() updates the model based on the data recieved', function() {

		var data = {"status":"success", "taxonomies":[{"id":"Q0ItMDAwMDcxOA==-QXV0aG9ycw==","name":"Jack Farchy","type":"authors"}]};
		following.set(data);
		expect(following.entities[0]).toBe(data.taxonomies[0]);
		expect(following.online).toBeTruthy();
	});


	it('set() only works if the data is correct', function() {
		var data = {"blah":[{"id":"Q0ItMDAwMDcxOA==-QXV0aG9ycw==","name":"Jack Farchy","type":"authors"}]};
		following.set(data);
		expect(following.entities.length).toBe(0);
		expect(following.online).not.toBeTruthy();
	});

});

describe('Updating the model', function() {

	it('a user can follow an author', function() {
		var callback = function() {}
		var getSpy = spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		}
		following.online = true;
		following.start(entity);
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
		following.online = true;
		following.stop(entity);
		var expectedUrl = 'http://personalisation.ft.com/follow/stopFollowing?userId=' + 
			'userId&type=authors&id=arjunId';

		expect(getSpy).toHaveBeenCalledWith(expectedUrl,'oFollowStopCallback');
	});
});


describe('Keeping the client and server in sync', function() {
	it('Makes any pending follow requests', function() {
		var following = new Following('testId');
		following.entities = [
			{"id":"1","name":"Saved author","type":"authors"},
			{"id":"2","name":"Unsaved Author","type":"authors"}
		]
		var server = [following.entities[0]];
		var startSpy = spyOn(following, 'start');
		following.sync(server);
		expect(startSpy).toHaveBeenCalledWith(following.entities[1]);
	});


	it('Makes any pending unfollow requests', function() {
		var following = new Following('testId');
		var server = [
			{"id":"1","name":"Unfollowed author","type":"authors"},
			{"id":"2","name":"Saved Author","type":"authors"}
		]
		following.entities = [server[1]];
		var stopSpy = spyOn(following, 'stop');
		following.sync(server);
		expect(stopSpy).toHaveBeenCalledWith(server[0]);
	});
});

describe('Adding and removing entity to client list', function() {
	it('adds entity and saves', function() {
		following.entities = [
			{"id":"1","name":"Saved author","type":"authors"},
			{"id":"2","name":"Another Author","type":"authors"}
		]		
		var newAuthor = {"id":"3","name":"New Author","type":"authors"}
		following.addEntity(newAuthor);
		expect(following.entities.length).toBe(3);
		expect(following.entities[2].name).toBe('New Author');
	});

	it('removes entity and saves', function() {
		following.entities = [
			{"id":"1","name":"Saved author","type":"authors"},
			{"id":"2","name":"Another Author","type":"authors"}
		]		
		var removeAuthor = {"id":"1","name":"Saved Author","type":"authors"}
		following.removeEntity(removeAuthor);
		expect(following.entities.length).toBe(1);
		expect(following.entities[0].name).toBe('Another Author');
	});
})