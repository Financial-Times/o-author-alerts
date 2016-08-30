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
	noticeText: "This service is about to be deprecated, you can still follow your favourite authors on the new <a href=\"https://next.ft.com/__opt-in?optedvia=falconauthalerts=https://next.ft.com\">FT.com</a> website. If you have any questions please contact FT.com <a href=\" http://aboutus.ft.com/contact-us/generalenquiries/#axzz3oeRwX4NU\">Help team</a>",
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
