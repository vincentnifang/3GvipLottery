var tabIntervals = new Array();

function onInitialize() {
	// Set icon on all open tabs.
	var tabs = chrome.tabs.getAllInWindow(null, function(tabs) { onInitializeIcon(tabs); });
	
	// Add event for new tabs.
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { onTabUpdated(tab); });
	
	// Add event to listen for messages from tabs.
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) { onRequest(request); });
}

function onInitializeIcon(tabs) {
	for (var tabIndex = 0, tab; tab = tabs[tabIndex]; tabIndex++) {
		if (!isChromeUrl(tab.url)) {
			showIcon(tab);
		}
	}
}

function onTabUpdated(tab) {
	if (!isChromeUrl(tab.url)) {
		showIcon(tab);
	}
}

function showIcon(tab) {
	// If this tab has an interval set, then activate it.
	var options = getOptions(tab);
	
	if (options.refresh == true) {
		// Begin refreshing this tab.
		onRequest({tab:tab, refresh:true});
	}
	else {
		// Stop timer (if one is running).
		stopRefresh(tab, true);
	}

	// Show the icon.
	chrome.pageAction.show(tab.id);
}

function isChromeUrl(url) {
	if (url.indexOf("chrome:") > -1) {
		return true;
	}
	else {
		return false;
	}
}

function getTabInterval(tab) {
	for (var i=0; i < tabIntervals.length; i++) {
		var tabInterval = tabIntervals[i];

		if (tabInterval.tab.id == tab.id) {
			return tabInterval;
		}
	}
	
	return null;
}

function deleteTabInterval(tabInterval) {
	for (var i=0; i < tabIntervals.length; i++) {
		if (tabIntervals[i] == tabInterval) {
			tabIntervals.splice(i, 1);
			
			return;
		}
	}
}

function stopRefresh(tab, updateIcon) {
	var options = getOptions(tab);
	var tabInterval = getTabInterval(tab);

	if (tabInterval != null) {
		// This is our tab.
		clearInterval(tabInterval.intervalId);
		
		// Delete the interval from our list.
		deleteTabInterval(tabInterval);
		
		if (updateIcon) {
			// Update icon.
			chrome.pageAction.setIcon({path:"images/refresh-off.png", tabId:tab.id});
			chrome.pageAction.show(tab.id);
			chrome.pageAction.setTitle({tabId: tab.id, title: 'Give me money'});
		}
		
		// Clear last-refresh time and save options.
		options.lastRefresh = null;
		options.nextRefresh = null;
		saveOptions(tab, options);
		//alert('stopped ' + tab.url);
	}
}

function isRefreshRunning(tab, interval) {
	var tabInterval = getTabInterval(tab);
	
	// Check if our tab is already in the running list with the same interval value.
	if (tabInterval != null && tabInterval.intervalValue == interval) {
		return true;
	}
	else {
		return false;
	}
}

function onRefresh(tab) {
	var options = getOptions(tab);
	var lastRefreshInterval;
	
	if (tab.url.indexOf("chrome.google.com") == -1 && tab.url.indexOf("file://") == -1) {
		// Refresh page and retain scroll position.
		chrome.tabs.update(tab.id, {url: options.url});
		//chrome.tabs.executeScript(tab.id, {code: 'location.reload(true);'}, function() {});
	}
	else {
		// The chrome web store can not be scripted. So use this method to reload instead. Only drawback is scroll position is lost, at least extension doesn't look broken.
		chrome.tabs.update(tab.id, {url: options.url});
		//chrome.tabs.update(tab.id, {url: tab.url});
	}
	
	// Check if we should randomize the interval.
	if (options.isRandom == true) {
		options = onRandomize(tab);
		
		// Set last-refresh time interval.
		lastRefreshInterval = options.random;
	}
	else {
		// Set last-refresh time interval.
		lastRefreshInterval = options.interval;
	}

	// Check if we should clear the cache.
	if (options.isCache == true) {
		chrome.browsingData.removeCache({ "since": 0 });
	}
	
	// Record last-refresh time and save options.
	options = updateLastRefresh(options, lastRefreshInterval);
	saveOptions(tab, options);
}

function onRequest(request) {
	if (request.refresh == true) {
		var options = getOptions(request.tab);
		var url = options.url;
		
		var interval = options.interval * 1000;
		
		if (options.random != null) {
			// Random is enabled.
			interval = options.random * 1000;
		}
		
		if (!isRefreshRunning(request.tab, interval)) {
			// Check if an existing timer is already running, if so, kill it.
			stopRefresh(request.tab, false);
			
			// Set timer.	
			intervalId = setInterval(function() { onRefresh(request.tab, options.random); }, interval);
		
			// Store interval for clearing later.
			tabIntervals.push({"tab": request.tab, "intervalId": intervalId, "intervalValue": interval});

			// Update last-refresh time and save options.
			options = updateLastRefresh(options, interval / 1000);
			saveOptions(request.tab, options);

			//alert('started ' + request.tab.url);
		}
		
		// Update icon.
		chrome.pageAction.setIcon({path:"images/refresh-on.png", tabId:request.tab.id});
		chrome.pageAction.show(request.tab.id);
		chrome.pageAction.setTitle({tabId: request.tab.id, title: 'Give me money ON : ' + (interval / 1000) + ' seconds'});
	}
	else {
		stopRefresh(request.tab, true);
	}
}

function onRandomize(tab) {
	// Read the current options.
	var options = getOptions(tab);
	
	// Create a random interval from 10 to the interval value.
	var interval = options.interval;
	var intervalValue = parseInt(interval, 10);
	if (intervalValue <= 10) {
		intervalValue = 60;
	}
	var randomInterval = getRandomInt(10, intervalValue);
	
	// Update the options.
	options.random = randomInterval;
	saveOptions(tab, options);
	
	// Begin refreshing this tab.
	onRequest({tab:tab, refresh:true});
	
	return options;
}