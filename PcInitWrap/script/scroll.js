//页面自定义滚动条
(function($){
	$(window).load(function(){
		$(".bs-content,.sideNav_toggle ,.editContent").mCustomScrollbar({
			theme:"minimal-dark",
			scrollInertia:0
		});	
	});

	

})(jQuery);
