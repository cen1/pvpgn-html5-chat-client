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
});

})(jQuery);
