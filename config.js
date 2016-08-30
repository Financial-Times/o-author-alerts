module.exports = {
	getFollowingUrl: "https://h2.ft.com/author-alerts/subscriptions",
	startAlertsUrl: "https://h2.ft.com/author-alerts/follow",
	stopAlertsUrl: "https://h2.ft.com/author-alerts/unfollow",
	stopAllUrl: "https://h2.ft.com/author-alerts/unfollowall",
	updateBulk: "https://h2.ft.com/author-alerts/updateBulk",
	metadataUrl: "http://metadata-cache.webservices.ft.com/v1/getAuthors/",
	lazyLoad: true,
	entityType: "Author",
	handleLoadErrorText: "No alerts available.",
	startAlertsText: "Start alerts",
	noticeText: "This service is moving to our <a href=\"https://next.ft.com/__opt-in?optedvia=falconauthalerts=https://next.ft.com\">new website</a>. You will still be able to follow your favourite authors via <a href=\"https://next.ft.com/__opt-in?optedvia=b2c-email&referrer=https://next.ft.com/myft\">myFT</a>. Following authors will create Instant Alerts, which can also be created for any other topic. <a href=\"https://next.ft.com/__opt-in?optedvia=falconauthalerts=https://next.ft.com\">Try it now</a>.",
	noticeTitle: "Notice: Author Alerts",
	stopAlertsText: "Alerting<i class=\"o-author-alerts__icon--tick\"></i>",
	widgetText: "Author alerts",
	popoverHeadingText: null,
	loadingText: "Loading data...",
	stopAlertsHoverText: "Click to stop alerts for this %entityType%",
	startAlertsHoverText: "Click to start alerts for this %entityType%",
	unsubscribeAllText: "You have been unsubscribed from all authors.",
	displayName: "%entityName%",
	frequencies: [
		{
			key: "daily",
			text: "Daily email"
		},
		{
			key: "immediate",
			text: "Immediate email"
		}
	]
};
