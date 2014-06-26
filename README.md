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
	
###Use cases
1. *Given an Article ID, I want buttons that lets me start/stop following all authors of that article*

		<ul class="o-follow" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-article-id="{{articleId}}"></ul>
		
2. *Given a logged in user, I want to create buttons for all the users that the user currently follows*

		<ul class="o-follow" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-user></ul>
	
3. *Given an author ID, I want a button that lets me start/stop following that particular author*

		<ul class="o-follow" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-entity='{"id": "Q0ItMDAwMDY0Mg==-QXV0aG9ycw==", "name": "Roman Olearchyk", "type": "author"}'>
			<li class="o-follow__entity">
				<span class="o-follow__name">Roman Olearchyk</span>
				<button data-o-follow-id="Q0ItMDAwMDY0Mg==-QXV0aG9ycw==" data-o-follow-name="Roman Olearchyk">Start Following</button>
			</li>
			<li class="o-follow__entity">
				<span class="o-follow__name">Christian Oliver</span>
				<button data-o-follow-id="Q0ItMDAwMDY1MA==-QXV0aG9ycw==" data-o-follow-name="Christian Oliver">Start Following</button>
			</li>
		</ul>
