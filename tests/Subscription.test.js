/*global require,describe,beforeEach,afterEach, jasmine,it,expect,spyOn*/
'use strict';

var Subscription = require('../src/js/Subscription'),
		eventHelper =  require('../src/js/lib/eventHelper.js'),
		jsonp =  require('../src/js/lib/jsonp.js');

var subscription;

beforeEach(function() {
	localStorage.removeItem('oAuthorAlertsUserCache-userId');
	subscription = new Subscription('userId');
});

afterEach(function() {
	localStorage.removeItem('oAuthorAlertsUserCache-userId');
});

describe('Getting the initial model', function() {


	it('get() makes a call to fetch the latest subscription data for a user', function() {
		var getSpy = spyOn(jsonp, 'get');
		subscription.get();
		var url = 'http://personalisation.ft.com/follow/getFollowingIds?userId=userId';
		expect(getSpy).toHaveBeenCalledWith(url, 'oAuthorAlertsGetCallback', jasmine.any(Function));
	});

	it('set() updates the model based on the data recieved', function() {
		var data = {"status":"success", "taxonomies":[{"id":"Q0ItMDAwMDcxOA==-QXV0aG9ycw==","name":"Jack Farchy","type":"authors","frequency": "immediate"}]};
		var eventSpy = spyOn(eventHelper, 'dispatch');
		subscription.set(data);
		expect(subscription.entities.length).toBe(1);
		expect(subscription.entities[0].id).toBe(data.taxonomies[0].id);
		expect(subscription.entities[0].frequency).toBe(data.taxonomies[0].frequency);
		expect(eventSpy).toHaveBeenCalledWith('oAuthorAlerts.userPreferencesLoad', subscription.entities);
	});

	it('set() only works if the data is correct', function() {
		var data = {"blah":[{"id":"Q0ItMDAwMDcxOA==-QXV0aG9ycw==","name":"Jack Farchy","type":"authors"}]};
		subscription.set(data);
		expect(subscription.entities).toBe(null);
	});

});

describe('Updating the model while online', function() {

	it('will send a request to unsubscribe to an author', function() {
		var getSpy = spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		};
		subscription.online = true;
		subscription.update(entity, 'off');
		var expectedUrl = 'http://personalisation.ft.com/follow/stopFollowing?userId=' +
			'userId&type=authors&name=Arjun&id=arjunId';

		expect(getSpy).toHaveBeenCalledWith(expectedUrl,'oAuthorAlertsUpdateCallback', jasmine.any(Function));
		// expect(subscription.entities.hasOwnProperty('arjunId')).toBe(true);
	});


	it('will send a request to change alert frequency of an author', function() {
		var getSpy = spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		};
		subscription.online = true;
		subscription.update(entity, 'immediate');
		var expectedUrl = 'http://personalisation.ft.com/follow/update?userId=' +
			'userId&type=authors&name=Arjun&id=arjunId&frequency=immediate';

		expect(getSpy).toHaveBeenCalledWith(expectedUrl,'oAuthorAlertsUpdateCallback', jasmine.any(Function));
		// expect(subscription.entities.hasOwnProperty('arjunId')).toBe(true);
	});

});

describe('Updating the model while offline', function() {

	it('will save a request to update an author', function() {
		var getSpy = spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		};
		subscription.online = false;
		subscription.update(entity, 'off');
		expect(getSpy).not.toHaveBeenCalled();
		var pending = JSON.parse(localStorage.getItem('oAuthorAlertsUserCache-userId'));
		expect(pending.arjunId.tried).toBe(1);
		expect(pending.arjunId.entity.name).toBe(entity.name);
		expect(pending.arjunId.update).toBe('off');
	});

	it('cancels out requests that would be obsolete', function() {
		spyOn(jsonp, 'get');
		var entity = {
			name: 'Arjun',
			id: 'arjunId'
		};

		subscription.online = false;
		subscription.update(entity, 'daily');
		var pending = JSON.parse(localStorage.getItem('oAuthorAlertsUserCache-userId'));
		expect(pending.arjunId.update).toBe('daily');
		subscription.update(entity, 'off');
		pending = JSON.parse(localStorage.getItem('oAuthorAlertsUserCache-userId'));
		expect(pending).not.toBeTruthy();
	});
});

describe('Handles response from the server', function() {

	it('successfully recieves data from the initial call', function() {
		var mockData = {'status': 'success', taxonomies: ['a', 'b']};
		subscription.online = false;
		var syncSpy = spyOn(subscription, 'sync');
		var eventSpy = spyOn(eventHelper, 'dispatch');
		subscription.set(mockData);
		expect(subscription.entities.length).toBe(2);
		expect(subscription.entities[0]).toBe('a');
		expect(subscription.online).toBe(true);
		expect(syncSpy).toHaveBeenCalled();
		expect(eventSpy).toHaveBeenCalledWith('oAuthorAlerts.userPreferencesLoad', subscription.entities);
	});

	it('handles errors from the initial call', function() {
		var mockData = {'status': 'error'};
		subscription.online = true;
		var syncSpy = spyOn(subscription, 'sync');
		var eventSpy = spyOn(eventHelper, 'dispatch');
		subscription.set(mockData);

		expect(subscription.entities).toBe(null);
		//only set offline in certain cases if follow/unfollow request failed, not the initial one
		expect(subscription.online).toBe(true);
		expect(syncSpy).not.toHaveBeenCalled();
		expect(eventSpy).not.toHaveBeenCalledWith('oAuthorAlerts.userPreferencesLoad', subscription.entities);

		expect(eventSpy.argsForCall[0][0]).toBe('oAuthorAlerts.serverError');
		expect(eventSpy.argsForCall[0][1].data).toBe(mockData);
		expect(eventSpy.argsForCall[0][1].entity).toBe(undefined);
		expect(eventSpy.argsForCall[0][1].action).toBe(undefined);
		expect(eventSpy.argsForCall[0][2]).toBe(undefined);

	});

it('successfully recieves data from update requests', function() {
		var mockData = {'status': 'success', taxonomies: ['a', 'b']};
		var mockEntity = { id: 'mockEntity' };
		subscription.online = false;
		var syncSpy = spyOn(subscription, 'sync');
		var removeSpy = spyOn(subscription, 'removeFromPending');
		var eventSpy = spyOn(eventHelper, 'dispatch');

		subscription.set(mockData, mockEntity, 'daily');

		expect(subscription.entities.length).toBe(2);
		expect(subscription.entities[0]).toBe('a');
		expect(subscription.online).toBe(true);
		expect(removeSpy).toHaveBeenCalledWith(mockEntity);
		expect(syncSpy).not.toHaveBeenCalled();
		expect(eventSpy.callCount).toEqual(1);


		expect(eventSpy.argsForCall[0][0]).toBe('oAuthorAlerts.updateSave');
		expect(eventSpy.argsForCall[0][1].data).toBe(mockData);
		expect(eventSpy.argsForCall[0][1].entity).toBe(mockEntity);
		expect(eventSpy.argsForCall[0][1].update).toBe('daily');
		expect(eventSpy.argsForCall[0][2]).not.toBeDefined();

	});

	it('retryable errors from update request will add to the list', function() {
		var mockData = {'status': 'error', 'message': 'retry me please'};
		var mockEntity = {id: 'mockEntity'} ;
		subscription.online = true;
		var syncSpy = spyOn(subscription, 'sync');
		var eventSpy = spyOn(eventHelper, 'dispatch');
		var addSpy = spyOn(subscription, 'addToPending');

		subscription.set(mockData, mockEntity, 'immediate');

		expect(subscription.entities).toBe(null);
		//only set offline in certain cases if follow/unfollow request failed, not the initial one
		expect(subscription.online).toBe(false);
		expect(addSpy).toHaveBeenCalledWith(mockEntity, 'immediate');
		expect(syncSpy).not.toHaveBeenCalled();

		expect(eventSpy.argsForCall[0][0]).toBe('oAuthorAlerts.serverError');
		expect(eventSpy.argsForCall[0][1].data).toBe(mockData);
		expect(eventSpy.argsForCall[0][1].entity).toBe(mockEntity);
		expect(eventSpy.argsForCall[0][1].update).toBe('immediate');
		expect(eventSpy.argsForCall[0][2]).not.toBeDefined();


	});


	it('dont retry if user is not subscribed to that person in the first place', function() {
		var mockData = {'status': 'error', 'message': 'user is not following this id'};
		var mockEntity = 'mockEntity';
		subscription.online = true;
		var addSpy = spyOn(subscription, 'addToPending');

		subscription.set(mockData, mockEntity, 'daily');

		//only set offline in certain cases if follow/unfollow request failed, not the initial one
		expect(subscription.online).toBe(true);
		expect(addSpy).not.toHaveBeenCalled();
	});

	it('dont retry if user has no subscription list', function() {
		var mockData = {'status': 'error', 'message': 'user has no following list'};
		var mockEntity = 'mockEntity';
		subscription.online = true;
		var addSpy = spyOn(subscription, 'addToPending');

		subscription.set(mockData, mockEntity, 'off');

		//only set offline in certain cases if follow/unfollow request failed, not the initial one
		expect(subscription.online).toBe(true);
		expect(addSpy).not.toHaveBeenCalled();
	});

});

describe('Keeping the client and server in sync', function() {
	it('Makes any pending requests', function() {
		var pending = {
			"startId": {
				"tried": 1,
				"entity": {
					"id": "startId",
					"name": "New Author"
				},
				"update": "daily"
			},
			"stopId": {
				"tried": 1,
				"entity": {
					"id": "stopId",
					"name": "Already subscribed"
				},
				"update": "off"
			}
		};

		localStorage.setItem('oAuthorAlertsUserCache-userId', JSON.stringify(pending));
		subscription = new Subscription('userId');
		subscription.entities = [];
		var updateSpy = spyOn(subscription, 'update');

		subscription.sync();

		expect(updateSpy.argsForCall[0][0]).toEqual(pending.startId.entity);
		expect(updateSpy.argsForCall[0][1]).toBe('daily');

		expect(updateSpy.argsForCall[1][0]).toEqual(pending.stopId.entity);
		expect(updateSpy.argsForCall[1][1]).toBe('off');

		expect(subscription.entities.length).toBe(1);
	});


	it('Updates the list that came from the server with any pending requests', function() {
		var pending = {
			"startId": {
				"tried": 1,
				"entity": {
					"id": "startId",
					"name": "New Author"
				},
				"update": "daily"
			},
			"stopId": {
				"tried": 1,
				"entity": {
					"id": "stopId",
					"name": "Already subscribed"
				},
				"update": "off"
			}
		};

		localStorage.setItem('oAuthorAlertsUserCache-userId', JSON.stringify(pending));
		subscription = new Subscription('userId');
		subscription.entities = [pending.stopId.entity];

		spyOn(subscription, 'update');

		//before syncing we have Already Subscribed in our list
		expect(subscription.entities.length).toBe(1);
		expect(subscription.entities[0].id).toBe('stopId');

		subscription.sync();

		//after syncing we only have the new Author in our list

		expect(subscription.entities.length).toBe(1);
		expect(subscription.entities[0].id).toBe('startId');
	});

	it('Gives up on requests after 3 attempts', function() {
		var pending = {
			"start1": {
				"tried": 5,
				"entity": {
					"id": "start1",
					"name": "Give up on me"
				},
				"update": "immediate"
			},
			"start2": {
				"tried": 1,
				"entity": {
					"id": "start2",
					"name": "Keep trying me"
				},
				"update": "daily"
			}
		};

		localStorage.setItem('oAuthorAlertsUserCache-userId', JSON.stringify(pending));
		subscription = new Subscription('userId');
		subscription.entities = [];
		var updateSpy = spyOn(subscription, 'update');

		subscription.sync();

		expect(updateSpy).toHaveBeenCalledWith(pending.start2.entity, 'daily');
		expect(subscription.entities.length).toBe(1);
		expect(subscription.entities[0].name).toBe('Keep trying me');

	});

});
