# o-author-alerts

** Warning: The server side functionality for this is yet to be implemented - so saving Immediate alerts will cause 
duplicate entries in your Author Alert preferences! **

A widget providing the UI and functionality to subscribe to Author Alerts on FT.com

##Construction

A product must provide the source HTML as shown below, based on the use case. 

The Alerts buttons are automatically initialised when the `o.DOMContentLoaded` event is triggered.

Alternatively, you can use the `init` method, as follows:

```js
	var oAuthorAlerts = require('o-author-alerts');
	oAuthorAlerts.init(rootEl);
```

where `rootEl` defaults to `document.body` if not specified.

####Configuration
You can optionally pass in some configuration to the Javascript, as follows:

```js
	var oAuthorAlerts = require('o-author-alerts');
	oAuthorAlerts.init(rootEl, {
		lazyLoad: false, // the default behaviour for the widget is to only load metadata on hover/click. Set to false to fetch data on page load.
		startAlertingText: "Follow %entityName%", //default: 'Start Alerts'
		stopAlertingText: "Unfollow %entityName%", //default: 'Alerting '
		widgetText: 'Your Alerts', //default: 'Author Alerts'
		popoverHeadingText: 'You are following:' //default: null,
		displayName: "Get email for %entityName%" //default: '%entityName%'. Set to false to hide the name.
	});
```

* `%entityName%` will be replaced with the name of the entity in the above examples.

####Font family

`<button>` elements need to be assigned a `font-family` or browsers will display the system default. Personalise the font like this:

```scss
// your-app.scss

// Override the default font
$o-author-alerts-button-font: BentonSans, sans-serif;

// Then, import the module
@import 'o-author-alerts/main';
```


##Content
The buttons can be created for you by passing in a data attribute on the root element:

* `data-o-author-alerts-article-id="<article UUID>"`
* `data-o-author-alerts-user`
* `data-o-author-alerts-entities='[{"name": "<entity name>", "id": "<entity id>"}, {"name": "<entity name>", "id": "<entity id>"}]'

##Appearance
By default, the Alerts component applies minimal styles to the list and header. There is also an option of displaying it as a widget. To do so, construct the HTML as shown in use case 2 below, with the `o-author-alerts--theme` class.


##Examples

1. *Given an Article ID, I want a list of buttons that lets me start/stop getting alerts all authors of that article*

		<div class="o-author-alerts" data-o-component="o-author-alerts" data-o-author-alerts-article-id="{{articleId}}"></div>
		
2. *Given an Article ID, I want a widget that displays the list of authors on hover*

		<div class="o-author-alerts o-author-alerts--theme" data-o-component="o-author-alerts" data-o-author-alerts-article-id="{{articleId}}"></div>

3. *Given a logged in user, I want to create buttons for all the users that the user currently gets alerts for*

		<div class="o-author-alerts" data-o-component="o-author-alerts" data-o-author-alerts-user></div>

4. *I want to create a standalone author alert button for an author I already have.*

		<div class="o-author-alerts" data-o-component="o-author-alerts" data-o-author-alerts-entities="[{"name": "Roman Olearchyk", "id": "Q0ItMDAwMDY0Mg==-QXV0aG9ycw=="}]"></div>


##Events

The Alerts component fires the following events:

* `oAuthorAlerts.userPreferencesLoad` - triggered on `document.body`
	* Fired when the user preferences have been successfully loaded
	* sends a list of entities being alerted as the event detail.

* `oAuthorAlerts.show` - triggered on the root element
	* Fired if the alerts widget/list is made visible on the page (i.e. if all backend calls 
		were successful, and there is at least one entity to display.)

* `oAuthorAlerts.saveChanges` - triggered on the root element
	* Fired when the save button is clicked (irregardless of whether it was successful or not)

* `oAuthorAlerts.updateSave` - triggered on `document.body`
	* Fired when a request to start/stop has been successfully saved to the server
	* _event.detail_ 
	
	```json
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
	 
* `oAuthorAlerts.serverError` - triggered on `document.body`
	* Fired when the personalisation service comes back with an error, either when updating or loading user preferences.
	* _event.detail_ 
	
	```json
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
	* When a user starts/stops getting alerts for someone
	* On the server update/errors

##Development Notes

* To test, run `npm test` in the root directory
* The alerts functionality only works if there is a valid `FT_User` cookie with an eRights ID. You'll need to make sure this cookie exists when running the demos locally.
	 	 
