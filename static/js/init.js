/* jQuery document ready */
(function($) {

	console.log("jQuery init");

  $(function() {

	M.AutoInit()
	
	$('.dropdown-button').dropdown();

	$('.collapsible').collapsible();

	$("#logo-image").attr("src", Config.logoUrl);

	$.each(Config.servers, function(val, text) {
		$("#select-server").append(
				$('<option></option>').val(val).html(text)
		);
	});
	$('select').formSelect();

	//Reorder text box and user list on mobil
	if ($("#loginUIContainer").css("z-index")==2) {
		console.log("mobile");
		$("#msgWrapperCol").insertBefore("#userlistBoxCol");
	}

	var mqOrientation = window.matchMedia("(orientation: portrait)");

	mqOrientation.addListener(function() {
		console.log("orientation changed");
		if ($("#loginUIContainer").css("z-index")==2) {
			console.log("orientationchange 1");
			$("#msgWrapperCol").insertBefore("#userlistBoxCol");
		}
		else {
			console.log("orientationchange 2");
			$("#userlistBoxCol").insertBefore("#msgWrapperCol");
		}
	});
});

})(jQuery);
