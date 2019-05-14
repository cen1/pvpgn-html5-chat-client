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
	let zHack = $("#hack").css("visibility");
	console.log(zHack)
	if (zHack=="hidden") {
		console.log("mobile");
		$("#userlistBoxCol").insertBefore("#chatBoxCol");
	}

	var mqOrientation = window.matchMedia("(orientation: portrait)");

	mqOrientation.addListener(function() {
		console.log("orientation changed");
		if ($("#hack").css("visibility")=="hidden") {
			console.log("orientationchange 1");
			$("#userlistBoxCol").insertBefore("#chatBoxCol");
		}
		else {
			console.log("orientationchange 2");
			$("#userlistBoxCol").insertAfter("#chatBoxCol");
		}
	});
});

})(jQuery);
