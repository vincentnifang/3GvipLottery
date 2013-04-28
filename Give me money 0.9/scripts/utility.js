function validateForm() {
	// Clear errors.
	$('#interval').removeClass('error');

	// Validate form.
	if ($('#interval').val().length < 1 || $('#interval').val() < 1) {
		$('#interval').addClass('error');
		$('#interval').focus();
		
		return false;
	}
	else {
		return true;
	}
}

function validateRegistrationForm() {
	var code = $.trim($('#txtCode').val());

	// Clear errors.
	$('#txtCode').removeClass('error');

	// Validate form.
	if (code.length < 6 || /^[a-zA-Z0-9_]+$/.test(code) == false) {
		$('#txtCode').addClass('error');
		$('#txtCode').focus();
		
		return false;
	}
	else {
		return true;
	}
}

function getDomain(url) {
    var a = document.createElement('a');
    a.href = url;
	
	var domain = a.hostname.replace('www.', '');
	
    return domain;
}

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateLastRefresh(options, interval) {
	// Record last-refresh time and save options.
	var now = new Date();
	var next = new Date(now.getTime() + interval * 1000);

	options.lastRefresh = formatDate(now, 'M/d/yyyy h:mm:ss a');
	options.nextRefresh = formatDate(next, 'M/d/yyyy h:mm:ss a');
	
	return options;
}

function getOptions(tab) {
	var key = getDomain(tab.url);
	var isDomain = true;
	
	// Try loading options from the domain first.
	var options = localStorage[key];
	if (options == null) {
		// The domain does not exist, try the url.
		key = tab.url;
		isDomain = false;
		options = localStorage[key];
	}

	if (options == null) {		
		// Create a new options.
		var options = {};
		options.interval = 10;
		options.refresh = false;
		options.random = null;
		options.isDomain = false;
		options.isCache = false;
		options.url = "http://sh.118100.cn/3Gvip/lotter/lotter!hitGoldenEggsThree.action";
	}
	else {
		// Parse the options from localStorage.
		options = JSON.parse(options);
	}
	
	return options;
}

function removeOptions(tab){
	var key = getDomain(tab.url);
	localStorage.removeItem(key);
}

function saveOptions(tab, options) {
	var key = getDomain(tab.url);
	options.isDomain = true;
	
	if (localStorage[key] == null) {
		// The domain does not exist, try the url.
		key = tab.url;
		options.isDomain = false;
	}
	
	localStorage[key] = JSON.stringify(options);
}
