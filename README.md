o-follow
========

A widget providing the UI and functionality to subscribe to Author Alerts on FT.com

##Construction

A product must provide the source HTML as shown below, based on the use case. The follow buttons must then be initialised with the following javascript. This will create buttons for every `o-follow` elements inside the specified `rootEl`: 

	var oFollow = require('o-follow');
	oFollow.init(rootEl);
	
###Use cases
1. *Given an Article ID, I want buttons that lets me start/stop following all authors of that article*

	```
	<div class="o-follow" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-article-id="{{articleId}}"></div>
	```
	
2. *Given a logged in user, I want to create buttons for all the users that the user currently follows*


	```	
    <div class="o-follow" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-user></div>

	```

3. *Given an author ID, I want a button that lets me start/stop following that particular author*


	```	
	<div class="o-follow" data-o-component="o-follow" data-o-version="0.1.0" data-o-follow-entity='{"id": "Q0ItMDAwMDY0Mg==-QXV0aG9ycw==", "name": "Roman Olearchyk", "type": "author"}'>
</div>
	```
	