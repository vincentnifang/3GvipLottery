function onInitialize() {
	chrome.tabs.getSelected(null, function(tab) {
		var options = getOptions(tab);
		
		// Set options.
		if (options != null) {
			var interval = options.interval;
			
			// Set random.
			if (options.isRandom == true) {
				// Random is enabled.
				interval = options.random + '?';
				$('#chkRandom').prop("checked", true);
			}
			else {
				$('#chkRandom').prop("checked", false);
			}
			
			// Set interval.
			$('#interval').val(interval);
			
			// Re-highlight the interval value.
			$('#interval').select();
			
			// Set on/off status.
			if (options.refresh == true) {
				$('#status').html('ON');
			}
			else {
				$('#status').html('OFF');
			}
			
			// Set domain.
			if (options.isDomain == true) {
				$('#chkDomain').prop("checked", true);
			}

			// Set cache.
			if (options.isCache == true) {
				$('#chkCache').prop("checked", true);
			}

			// Set last refresh statistics.
			if (isRegistered() && options.lastRefresh != null) {
				$('#lblLastRefresh').text(options.lastRefresh);
				$('#lblNextRefresh').text(options.nextRefresh);
			}
			else {
				$('#lblLastRefresh').text('n/a');
				$('#lblNextRefresh').text('n/a');
			}
		}

		// Update domain name in checkbox label.
		$('#lblDomain').text(getDomain(tab.url));
	});
	
	// Enable number validation on the textbox.
    $("#interval").keydown(function(event) {
        // Allow only backspace and delete
        if ( event.keyCode == 46 || event.keyCode == 8 ) {
            // let it happen, don't do anything
        }
        else {
            // Ensure that it is a number and stop the keypress
			if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                event.preventDefault(); 
            }   
        }
    });	

	setupUi();
}

function setupUi() {
	// Highlight the interval value.
	$('#interval').select();

	// Set slide effect on lock icon.
	$('#imgLock').click(function () {
		$('#registrationCodeDiv').slideToggle('normal');
		$('#txtCode').focus();
    });

	// Set slide effect on advanced options.
	$("#advancedOptionsDiv").click(function () {
	  // Change expand icon depending if options are currently shown or not.
	  if ($('#advancedOptions').is(':visible')) {
		$('#imgAdvancedOptions').removeClass('ui-icon-circle-triangle-s');
		$('#imgAdvancedOptions').addClass('ui-icon-circle-triangle-e');
	  }
	  else {
		$('#imgAdvancedOptions').removeClass('ui-icon-circle-triangle-e');
		$('#imgAdvancedOptions').addClass('ui-icon-circle-triangle-s');
	  }

	  // Slide up/down the options.
      $("#advancedOptions").slideToggle("normal");
    });
	
	// Set enter key on registration code field to auto-click the register button.
	$('#txtCode').keypress(function(e) {
	  if (e.which == 13) {
		$('#btnRegister').click();
      }
    });

	// Setup button click events.
	$('#btnStart').click(function() {
		onEnable();
	});

	$('#btnStop').click(function() {
		onDisable();
	});
	
	$('#chkDomain').click(function() {
		onDomain();
	});
	
	$('#chkRandom').click(function() {
		onRandom();
	});

	$('#chkCache').click(function() {
		onCache();
	});

	$('#btnRegister').click(function() {
		validateRegistrationCode();
	});
	
	// Update registration text.
	checkRegistration();
}

function onEnable() {
	if (validateForm()) {
		// Get the currently selected tab.
		chrome.tabs.getSelected(null, function(tab) {
			var options = {};
			
			options.interval = $('#interval').val();
			options.refresh = true;
			options.isRandom = $('#chkRandom').is(':checked');
			options.random = options.interval;
			options.isDomain = $('#chkDomain').is(':checked');
			options.isCache = $('#chkCache').is(':checked');
			options.url = $('#url').val();
			
			// Save the interval for this tab's url.
			updateOptions(tab, options);
			
			// Send request to parent to begin refresh task for this tab.
			chrome.extension.sendRequest({tab:tab, refresh:options.refresh}, function(response) { });
			
			window.close();
		});
	}
}

function onDisable() {
	if (validateForm()) {
		// Get the currently selected tab.
		chrome.tabs.getSelected(null, function(tab) {
			var options = {};
			
			options.interval = $('#interval').val();
			options.refresh = false;
			options.isRandom = $('#chkRandom').is(':checked');
			options.random = options.interval;
			options.isDomain = $('#chkDomain').is(':checked');
			options.isCache = $('#chkCache').is(':checked');
			options.url = $('#url').val();
			
			// Save the interval for this tab's url.
			updateOptions(tab, options);

			// Send request to parent to end refresh task for this tab.
			chrome.extension.sendRequest({tab:tab, refresh:options.refresh}, function(response) { });
			
			window.close();
		});
	}
}

function onRandom() {
	if (validateForm()) {
		// Get the currently selected tab.
		chrome.tabs.getSelected(null, function(tab) {		
			if ($('#chkRandom').is(':checked') == false) {
				// Random is disabled, so remove the '?' from the interval.
				$('#interval').val($('#interval').val().replace(/\?/g, ''));
			}
			else {
				// Random is enabled, so include a '?' on the interval.
				$('#interval').val($('#interval').val() + '?');
			}
			
			var options = getOptions(tab);

			options.interval = $('#interval').val();
			// options.refresh = false; // Leave value alone.
			options.isRandom = $('#chkRandom').is(':checked');
			options.random = options.interval;
			options.isDomain = $('#chkDomain').is(':checked');
			options.isCache = $('#chkCache').is(':checked');
			options.url = $('#url').val();
			
			// Save the interval for this tab's url.
			updateOptions(tab, options);
		});
	}
}

function onDomain() {
	if (validateForm()) {
		// Get the currently selected tab.
		chrome.tabs.getSelected(null, function(tab) {
			if ($('#chkDomain').is(':checked')) {
				var options = getOptions(tab);

				options.interval = $('#interval').val();
				// options.refresh = false; // Leave value alone.
				options.isRandom = $('#chkRandom').is(':checked');
				options.random = options.interval;
				options.isDomain = $('#chkDomain').is(':checked');
				options.isCache = $('#chkCache').is(':checked');
				options.url = $('#url').val();
			
				// Create entry on domain key.
				localStorage[getDomain(tab.url)] = options;
				
				// Save the interval for this tab's url.
				updateOptions(tab, options);
			}
			else {
				// Delete the key for the domain.
				localStorage.removeItem(getDomain(tab.url))
			}
		});
	}
}

function onCache() {
	if (validateForm()) {
		// Get the currently selected tab.
		chrome.tabs.getSelected(null, function(tab) {		
			var options = getOptions(tab);

			options.interval = $('#interval').val();
			// options.refresh = false; // Leave value alone.
			options.isRandom = $('#chkRandom').is(':checked');
			options.random = options.interval;
			options.isDomain = $('#chkDomain').is(':checked');
			options.isCache = $('#chkCache').is(':checked');
			options.url = $('#url').val();
			
			// Save the interval for this tab's url.
			updateOptions(tab, options);
		});
	}
}

function updateOptions(tab, options) {
	// Remove '?' character from interval.
	options.interval = options.interval.replace(/\?/g, '');
	options.random = options.random.replace(/\?/g, '');
	
	// Save options.
	saveOptions(tab, options);
	
	return options;
}

// Hack to make focusing on a text field work in Chrome. Yes, it actually works. http://code.google.com/p/chromium/issues/detail?id=111660#c7
if (location.search !== "?foo") {
  location.search = "?foo";
  throw new Error;  // load everything on the next page;
                    // stop execution on this page
}