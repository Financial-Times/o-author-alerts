var Following = require('../src/js/Following'),
		jsonp =  require('../src/js/lib/jsonp.js');

var following;

beforeEach(function() {
	following = new Following('userId');
});

afterEach(function() {
	localStorage.removeItem('oFollowUserCache-userId');
})

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
		expect(following.entities["Q0ItMDAwMDcxOA==-QXV0aG9ycw=="].id).toBe(data.taxonomies[0].id);
	});


	it('set() only works if the data is correct', function() {
		var data = {"blah":[{"id":"Q0ItMDAwMDcxOA==-QXV0aG9ycw==","name":"Jack Farchy","type":"authors"}]};
		following.set(data);
		expect(Object.keys(following.entities).length).toBe(0);
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

		expect(getSpy).toHaveBeenCalledWith(expectedUrl,'oFollowStartCallback', jasmine.any(Function));
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

		expect(getSpy).toHaveBeenCalledWith(expectedUrl,'oFollowStopCallback', jasmine.any(Function));
	});
});


describe('Keeping the client and server in sync', function() {
	it('Makes any pending follow requests', function() {
		var pending = {
			"tried": 0,
			"client": {
				"1": {"id":"1","name":"Saved author","type":"authors"},
				"2": {"id":"2","name":"Unsaved Author","type":"authors"}
			},
			"server": {
				"1": {"id":"1","name":"Saved author","type":"authors"}
			}
		}
		localStorage.setItem('oFollowUserCache-userId', JSON.stringify(pending));
		var startSpy = spyOn(following, 'start');
		following.get();

		expect(startSpy).toHaveBeenCalledWith(pending.client["2"]);
	});


	it('Makes any pending unfollow requests', function() {
		var pending = {
			"tried": 0,
			"client": {
				"1": {"id":"1","name":"Saved author","type":"authors"}
			},
			"server": {
				"1": {"id":"1","name":"Saved author","type":"authors"},
				"2": {"id":"2","name":"Unsaved Author","type":"authors"}
			}
		};
		localStorage.setItem('oFollowUserCache-userId', JSON.stringify(pending));
		var stopSpy = spyOn(following, 'stop');
		following.get();
		expect(stopSpy).toHaveBeenCalledWith(pending.server["2"]);
	});

	it('Does nothing if server already in sync', function() {
		var pending = {
			"tried": 0,
			"client": {
				"1": {"id":"1","name":"Saved author","type":"authors"}
			},
			"server": {
				"1": {"id":"1","name":"Saved author","type":"authors"}
			}
		};
		localStorage.setItem('oFollowUserCache-userId', JSON.stringify(pending));
		var stopSpy = spyOn(following, 'stop');
		var startSpy = spyOn(following, 'start');
		var jsonSpy = spyOn(jsonp, 'get');
		following.get();
		expect(startSpy).not.toHaveBeenCalled();
		expect(stopSpy).not.toHaveBeenCalled();
		expect(jsonSpy).toHaveBeenCalled();
	});
});

describe('Adding and removing entity to client list', function() {
	it('adds entity and saves', function() {
		following.entities = {
			"1":{"id":"1","name":"Saved author","type":"authors"},
			"2": {"id":"2","name":"Another Author","type":"authors"}
		}	
		var newAuthor = {"id":"3","name":"New Author","type":"authors"}
		following.addEntity(newAuthor);
		expect(Object.keys(following.entities).length).toBe(3);
		expect(following.entities["3"].name).toBe('New Author');
	});

	it('removes entity and saves', function() {
		following.entities = {
			"1":{"id":"1","name":"Saved author","type":"authors"},
			"2": {"id":"2","name":"Another Author","type":"authors"}
		}
		var removeAuthor = {"id":"1","name":"Saved Author","type":"authors"}
		following.removeEntity(removeAuthor);
		expect(Object.keys(following.entities).length).toBe(1);
		expect(following.entities["2"].name).toBe('Another Author');
	});

	it('doesnt add if it is already there', function() {
		following.entities = {
			"1":{"id":"1","name":"Saved author","type":"authors"},
			"2": {"id":"2","name":"Another Author","type":"authors"}
		}	
		var removeAuthor = {"id":"1","name":"Saved Author","type":"authors"}
		following.removeEntity(removeAuthor);
		expect(Object.keys(following.entities).length).toBe(1);
		expect(following.entities["2"].name).toBe('Another Author');
	});
})