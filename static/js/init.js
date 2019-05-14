/* jQuery document ready */
(function($) {

	console.log("jQuery init");

  $(function() {
		
		$('.dropdown-button').dropdown();
		$("[data-activates=nav-mobile]").sideNav({
			closeOnClick: true
		});
		$("[data-activates=chatroom-mobile]").sideNav({
			closeOnClick: true,
			edge: 'right'
		});

		$('.collapsible').collapsible();

		$("#logo-image").attr("src", Config.logoUrl);

		$.each(Config.servers, function(val, text) {
			$("#select-server").append(
					$('<option></option>').val(val).html(text)
			);
		});
		$('select').material_select();		
	});
})(jQuery);
