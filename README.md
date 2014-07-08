o-follow
========

A widget providing the UI and functionality to subscribe to Author Alerts on FT.com

##Construction

A product must provide the source HTML as shown below, based on the use case. 

The follow buttons are automatically initialised when the `o.DOMContentLoaded` is triggered.

Alternatively, you can use the `createAllIn` method on the prototype, as follows:

	var oFollow = require('o-follow');
	oFollow.prototype.createAllIn(rootEl);

where `rootEl` defaults to `document.body` if not specified.

##Content
The buttons can be created from elements already existing in the DOM (i.e. if you already have author ID/name available on the page), or by passing in a data attribute on the root element:

* `data-o-follow-article-id="<article UUID>""`
* `data-o-follow-user`

##Appearance
By default, the follow component applies minimal styles to the list and header. There is also an option of displaying it as a widget. To do so, construct the HTML as shown in use case 2 below, with the `o-follow--theme` class.


##Use cases

1. *Given an Article ID, I want a list of buttons that lets me start/stop following all authors of that article*

		<div class="o-follow" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-article-id="{{articleId}}">
			<h3 class="o-follow__header">HEADER</h3>
			<ul class="o-follow__list">
			</ul>
		</div>
		
1. *Given an Article ID, I want a widget that displays the list of authors on hover*

		<div class="o-follow o-follow--theme" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-article-id="{{articleId}}">
			<a href="" class="o-follow__widget">Author Alerts<i class="icon-arrow-down"></i></a>
			<div class="o-follow__popover" will-change>
			<h3 class="o-follow__header">HEADER</h3>
			<ul class="o-follow__list">

			</ul>
			</div>
		</div>

2. *Given a logged in user, I want to create buttons for all the users that the user currently follows*

		<div class="o-follow" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-user>
			<a href="" class="o-follow__widget">Your Alerts<i class="icon-arrow-down"></i></a>
			<div class="o-follow__popover" will-change>
			<h3 class="o-follow__header">You are following:</h3>
			<ul class="o-follow__list">

			</ul>
			</div>
		</div>

3. *I want to create a standalone author alert button for an author I already have.


		<div class="o-follow" data-o-component="o-follow" data-o-version="0.1.0">
			<div class="o-follow__list">
			<div class="o-follow__entity">
				<button  class="o-follow__button" data-o-follow-id="{{authorId}}" data-o-follow-name="{{authorName}}">Start Following</button> 
			</div>
			</div>
		</div>


##Events

The follow component fires the following events:

* `oFollow.userPreferencesLoaded` - triggered on `document.body`
	* Fired when the user preferences have been successfully loaded
	* sends a list of entities being followed as the event detail.
* `oFollow.shown` - triggered on the root element
	* Fired if the follow widget/list is made visible on the page (i.e. if all backend calls 
		were successful, and there is at least one entity to display.)
* `oFollow.widgetOpened` - triggered on the root element 
	* Fired when the user hovers over a widget and it is opened.
* `oFollow.startFollowing`, `oFollow.stopFollowing` - - triggered on the root element
	* Fired when a request to start/stop following has been fired (regardless of whether it was successful or not)
	* _event.detail_ 
	
	```
		{
			entity: {
				id: <entity id>,
				name: <entity name>
			},
			userId: <userId>
	 	}
	 ```
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
	 	 