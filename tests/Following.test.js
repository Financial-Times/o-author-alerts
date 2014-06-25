var Following = require('../src/js/Following'),
		event =  require('../src/js/lib/event.js'),
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
	});

	it('set() updates the model based on the data recieved', function() {
		var data = {"status":"success", "taxonomies":[{"id":"Q0ItMDAwMDcxOA==-QXV0aG9ycw==","name":"Jack Farchy","type":"authors"}]};
		following.set(data);
		expect(following.entities.length).toBe(1);
		expect(following.entities[0].id).toBe(data.taxonomies[0].id);
	});


	it('set() only works if the data is correct', function() {
		var data = {"blah":[{"id":"Q0ItMDAwMDcxOA==-QXV0aG9ycw==","name":"Jack Farchy","type":"authors"}]};
		following.set(data);
		expect(Object.keys(following.entities).length).toBe(0);
	});

});

describe('Updating the model while online', function() {

	it('will send a request to follow an author', function() {
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

	it('will send a request to unfollow an author', function() {
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

describe('Updating the model while offline', function() {

	it('will save a request to follow an author', function() {
		var callback = function() {}
		var getSpy = spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		}
		following.online = false;
		following.start(entity);
		expect(getSpy).not.toHaveBeenCalled();
		var pending = JSON.parse(localStorage.getItem('oFollowUserCache-userId'));
		expect(pending['arjunId'].tried).toBe(1);
		expect(pending['arjunId'].entity.name).toBe(entity.name);
		expect(pending['arjunId'].action).toBe('start');
	});

	it('will save a request to unfollow an author', function() {
		var callback = function() {}
		var getSpy = spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		}
		following.online = false;
		following.stop(entity);

		expect(getSpy).not.toHaveBeenCalled();
		var pending = JSON.parse(localStorage.getItem('oFollowUserCache-userId'));

		expect(pending['arjunId'].tried).toBe(1);
		expect(pending['arjunId'].entity.name).toBe(entity.name);
		expect(pending['arjunId'].action).toBe('stop')
	});

	it('cancels out requests that would be obsolete', function() {
		var callback = function() {}
		var getSpy = spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		}
		following.online = false;
		following.start(entity);
		var pending = JSON.parse(localStorage.getItem('oFollowUserCache-userId'));
		expect(pending['arjunId'].action).toBe('start');
		following.stop(entity);
		pending = JSON.parse(localStorage.getItem('oFollowUserCache-userId'));
		expect(pending).not.toBeTruthy();
	})
});

describe('Handles response from the server', function() {

	it('successfully recieves data from the initial call', function() {
		var mockData = {'status': 'success', taxonomies: ['a', 'b']};
		following.online = false;
		var syncSpy = spyOn(following, 'sync');
		var eventSpy = spyOn(event, 'dispatch');
		following.set(mockData);

		expect(following.entities.length).toBe(2);
		expect(following.entities[0]).toBe('a');
		expect(following.online).toBe(true);
		expect(syncSpy).toHaveBeenCalled();
		expect(eventSpy).toHaveBeenCalledWith('oFollow.userPreferencesLoaded', following.entities);
	});

	it('handles errors from the initial call', function() {
		var mockData = {'status': 'error'};
		following.online = true;
		var syncSpy = spyOn(following, 'sync');
		var eventSpy = spyOn(event, 'dispatch');
		following.set(mockData);

		expect(following.entities.length).toBe(0);
		//only set offline in certain cases if follow/unfollow request failed, not the initial one
		expect(following.online).toBe(true);
		expect(syncSpy).not.toHaveBeenCalled();
		expect(eventSpy).not.toHaveBeenCalled();
	});

it('successfully recieves data from update requests', function() {
		var mockData = {'status': 'success', taxonomies: ['a', 'b']};
		var mockEntity = 'mockEntity';
		following.online = false;
		var syncSpy = spyOn(following, 'sync');
		var removeSpy = spyOn(following, 'removeFromPending');
		var eventSpy = spyOn(event, 'dispatch');

		following.set(mockData, mockEntity, 'start');

		expect(following.entities.length).toBe(2);
		expect(following.entities[0]).toBe('a');
		expect(following.online).toBe(true);
		expect(removeSpy).toHaveBeenCalledWith(mockEntity);
		expect(syncSpy).not.toHaveBeenCalled();
		expect(eventSpy).not.toHaveBeenCalled();
	});

	it('retryable errors from update request will add to the list', function() {
		var mockData = {'status': 'error', 'message': 'retry me please'};
		var mockEntity = 'mockEntity';
		following.online = true;
		var syncSpy = spyOn(following, 'sync');
		var eventSpy = spyOn(event, 'dispatch');
		var addSpy = spyOn(following, 'addToPending');

		following.set(mockData, mockEntity, 'start');

		expect(following.entities.length).toBe(0);
		//only set offline in certain cases if follow/unfollow request failed, not the initial one
		expect(following.online).toBe(false);
		expect(addSpy).toHaveBeenCalledWith(mockEntity, 'start');
		expect(syncSpy).not.toHaveBeenCalled();
		expect(eventSpy).not.toHaveBeenCalled();
	});


	it('dont retry if user is not following that person in the first place', function() {
		var mockData = {'status': 'error', 'message': 'user is not following this id'};
		var mockEntity = 'mockEntity';
		following.online = true;
		var syncSpy = spyOn(following, 'sync');
		var eventSpy = spyOn(event, 'dispatch');
		var addSpy = spyOn(following, 'addToPending');

		following.set(mockData, mockEntity, 'start');

		//only set offline in certain cases if follow/unfollow request failed, not the initial one
		expect(following.online).toBe(true);
		expect(addSpy).not.toHaveBeenCalled();
	});

	it('dont retry if user has no following list', function() {
		var mockData = {'status': 'error', 'message': 'user has no following list'};
		var mockEntity = 'mockEntity';
		following.online = true;
		var syncSpy = spyOn(following, 'sync');
		var eventSpy = spyOn(event, 'dispatch');
		var addSpy = spyOn(following, 'addToPending');

		following.set(mockData, mockEntity, 'start');
 	
		//only set offline in certain cases if follow/unfollow request failed, not the initial one
		expect(following.online).toBe(true);
		expect(addSpy).not.toHaveBeenCalled();
	});

})

describe('Keeping the client and server in sync', function() {
	it('Makes any pending requests', function() {
		var pending = {
			"startId": {
				"tried": 1,
				"entity": {
					"id": "startId",
					"name": "Leftover Author"
				},
				"action": "start"
			},
			"stopId": {
				"tried": 1,
				"entity": {
					"id": "stopId",
					"name": "Another Author"
				},
				"action": "stop"
			}
		}
		localStorage.setItem('oFollowUserCache-userId', JSON.stringify(pending));
		following = new Following('userId');
		following.entities = [];
		var startSpy = spyOn(following, 'start');
		var stopSpy = spyOn(following, 'stop');
		following.sync();

		expect(startSpy).toHaveBeenCalledWith(pending["startId"].entity);
		expect(stopSpy).toHaveBeenCalledWith(pending["stopId"].entity);
	});

	it('Updates the list that came from the server with any pending requests', function() {
		var pending = {
			"startId": {
				"tried": 1,
				"entity": {
					"id": "startId",
					"name": "New Author"
				},
				"action": "start"
			},
			"stopId": {
				"tried": 1,
				"entity": {
					"id": "stopId",
					"name": "Already following"
				},
				"action": "stop"
			}
		}
		localStorage.setItem('oFollowUserCache-userId', JSON.stringify(pending));
		following = new Following('userId');
		following.entities = [pending['stopId'].entity];
		spyOn(following, 'start');
		spyOn(following, 'stop');

		expect(following.entities.length).toBe(1);
		expect(following.entities[0].id).toBe('stopId')

		following.sync();

		expect(following.entities.length).toBe(1);
		expect(following.entities[0].id).toBe('startId')
	});

	it('Gives up on requests after 3 attempts', function() {
		var pending = {
			"start1": {
				"tried": 3,
				"entity": {
					"id": "start1",
					"name": "Give up on me"
				},
				"action": "start"
			},
			"start2": {
				"tried": 1,
				"entity": {
					"id": "start2",
					"name": "Keep trying me"
				},
				"action": "start"
			}
		}
		localStorage.setItem('oFollowUserCache-userId', JSON.stringify(pending));
		following = new Following('userId');
		following.entities = [];
		var startSpy = spyOn(following, 'start');
		following.sync();

		expect(startSpy).toHaveBeenCalledWith(pending["start2"].entity);
		expect(following.entities.length).toBe(1);
		expect(following.entities[0].name).toBe('Keep trying me');

	})

});
