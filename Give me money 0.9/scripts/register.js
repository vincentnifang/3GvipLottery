function isRegistered() {
	// Check localStorage for valid registration code.
	var code = protect(localStorage["Expression"]);
	if (code.indexOf("^O") == 0 && code.indexOf("0$") == code.length - 2) {
		return true;
	}
	else {
		return false;
	}
}

function checkRegistration() {
	// Check localStorage for valid registration code.
	if (isRegistered()) {
		// Set icon and text to show registered info.
		$('#imgLock').css('backgroundPosition', '-16px 0px'); // show medal icon
		$('#imgLock').attr('title', 'Registered');
		$('#imgLock').unbind('hover');
		$('#imgLock').unbind('mouseleave');
		$('#registerLink').html('Registered');
		$('#registrationCodeDiv').html('<div style="padding-left:4px; color:#606060;">Professional Edition</div>');
		$('#trialText').hide();
		
		// Enable registered features.
		$('#chkDomain').removeAttr("disabled");
		$('#chkRandom').removeAttr("disabled");
		$('#chkCache').removeAttr("disabled");
		$('#advancedOptions').css("color", '#000000');
		
		localStorage.feedbackOptOut = 'true';
	}
	else {
		// Disable registered features.
		$('#chkDomain').attr("disabled", true);
		$('#chkRandom').attr("disabled", true);
		$('#chkCache').attr("disabled", true);
		$('#advancedOptions').css("color", '#606060');
		
		$('#imgLock').hover(function() { 
			$('#imgLock').css('backgroundPosition', '-32px 0px');
			$('#imgLock').css('cursor', 'pointer');
		}).mouseleave(function() {
			$('#imgLock').css('backgroundPosition', '0px 0px');
			$('#imgLock').css('cursor', 'auto');
		});

		localStorage.removeItem('feedbackOptOut');
	}
}

function validateRegistrationCode() {
	// First, validate the registration code form.
	if (validateRegistrationForm()) {
		var code = $.trim($('#txtCode').val());
		
		// Send the code to the server to validate.
		var response = getUrlResponse('http://www.dummysoftware.com/cgi-bin/checkregcode_easyautorefresh.pl?' + code);
		response.result = 'OK';
		if (response != null && response.result == 'OK') {
			// Store the registration code in localStorage.
			localStorage["Expression"] = protect('^O' + code + '0$');

			// Success, update the registered text.
			checkRegistration();
			
			// Collapse the registration details after closing the modal dialog.
			$("#dialog-message").bind("dialogclose", function(event, ui) {
			  $("#registrationCodeDiv").slideToggle("normal");
			});

			// Set modal icon.
			$('#dialog-message-icon').removeClass('ui-icon-circle-close');
			$('#dialog-message-icon').addClass('ui-icon-circle-check');
		}
		else {
			$('#dialog-message-icon').addClass('ui-icon-circle-close');
		}
		
		// Display the message (success or error).
		$('#dialog-message-text').text(response.message);

		// Display modal dialog.
		$.blockUI({ 
            message: $('#dialog-message'), 
            showOverlay: false, 
            centerY: true,
			timeout: 10000,
			css: {
				width: '220px',
				top: '14px',
				left: '20px'
			}
        });		

		$('#dialog-message').click($.unblockUI);
	}
}

function getUrlResponse(url) {
  var response;

  $.ajax({ 
	async: false,
	type: 'GET',
	dataType: 'json',
	url: url,
	success: function(data) { response = data; },
	error: function(xhr, ajaxOptions, thrownError) { alert(thrownError); }
  });
  
  return response;
}

function protect(text) {
	var key = 7;
	var result = "";
	
	if (text != null) {
		for (i=0; i<text.length; ++i)
		{
			result += String.fromCharCode(key ^ text.charCodeAt(i));
		}
	}
	
	return result;
}
