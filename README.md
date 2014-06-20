o-follow
========

A widget providing the UI and functionality to subscribe to Author Alerts on FT.com

##Use cases
1. *Given an Article ID, I want buttons that lets me start/stop following all authors of that article*
	
	var oFollow = require('o-follow');
	oFollow.createForArticle(el, 'articleId');
	
	

2. *Given a user ID, I want to create buttons for all the users that the user currently follows*


3. *Given an author ID, I want a button that lets me start/stop following that particular author*