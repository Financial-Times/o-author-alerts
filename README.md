o-follow
========

A widget providing the UI and functionality to subscribe to Author Alerts on FT.com

##Construction

A product must provide the source HTML as shown below, based on the use case. 

The follow buttons are automatically initialised when the `o.DOMContentLoaded` event is triggered.

Alternatively, you can use the `createAllIn` method on the prototype, as follows:

	var oFollow = require('o-follow');
	oFollow.prototype.createAllIn(rootEl);

where `rootEl` defaults to `document.body` if not specified.

####Configuration
You can optionally pass in some configuration to the Javascript, as follows:

	var oFollow = require('o-follow');
	oFollow.prototype.createAllIn(rootEl, {
		startFollowingText: "Follow %entityName%", //default: 'Start'
		stopFollowingText: "Unfollow %entityName%", //default: 'Stop'
		widgetText: 'Your Alerts', //default: 'Author Alerts'
		popoverHeadingText: 'You are following:' //default: 'Get alerts for:',
		displayName: "Get email for %entityName%" //default: '%entityName%'. Set to false to hide the name.
	});

* `%entityName%` will be replaced with the name of the entity in the above examples.



##Content
The buttons can be created for you by passing in a data attribute on the root element:

* `data-o-follow-article-id="<article UUID>"`
* `data-o-follow-user`
* `data-o-follow-entities='[{"name": "<entity name>", "id": "<entity id>"}, {"name": "<entity name>", "id": "<entity id>"}]'

##Appearance
By default, the follow component applies minimal styles to the list and header. There is also an option of displaying it as a widget. To do so, construct the HTML as shown in use case 2 below, with the `o-follow--theme` class.


##Examples

1. *Given an Article ID, I want a list of buttons that lets me start/stop following all authors of that article*

		<div class="o-follow" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-article-id="{{articleId}}"></div>
		
2. *Given an Article ID, I want a widget that displays the list of authors on hover*

		<div class="o-follow o-follow--theme" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-article-id="{{articleId}}"></div>

3. *Given a logged in user, I want to create buttons for all the users that the user currently follows*

		<div class="o-follow" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-user></div>

4. *I want to create a standalone author alert button for an author I already have.*

		<div class="o-follow" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-entities="[{"name": "Roman Olearchyk", "id": "Q0ItMDAwMDY0Mg==-QXV0aG9ycw=="}]"></div>


##Events

The follow component fires the following events:

* `oFollow.userPreferencesLoaded` - triggered on `document.body`
	* Fired when the user preferences have been successfully loaded
	* sends a list of entities being followed as the event detail.

* `oFollow.show` - triggered on the root element
	* Fired if the follow widget/list is made visible on the page (i.e. if all backend calls 
		were successful, and there is at least one entity to display.)

* `oFollow.updateSaved` - triggered on `document.body`
	* Fired when a request to start/stop has been successfully saved to the server
	* _event.detail_ 
	
	```
		{
			data: <response from server>,
			action: <'start' or 'stop'>,
			entity: {
				id: <entity id>,
				name: <entity name>
			},
			userId: <userId>
	 	}
	 ```
	 
* `oFollow.serverError` - triggered on `document.body`
	* Fired when the personalisation service comes back with an error, either when updating or loading user preferences.
	* _event.detail_ 
	
	```
		{
			data: <response from server>,
			action: <'start' or 'stop'>,
			entity: {
				id: <entity id>,
				name: <entity name>
			},
			userId: <userId>
	 	}
	 ```

There are also tracking events fired for various events on the page:
	* When a widget is shown on a page
	* When the widget is opened
	* When a user starts/stops following someone
	* On the server update/errors

##Development Notes

* To test, run `npm test` in the root directory
* The follow functionality only works if there is a valid `FT_User` cookie with an eRights ID. You'll need to make sure this cookie exists when running the demos locally.
	 	 