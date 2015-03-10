jQuery(function($) {'use strict',

	//Pretty Photo
	 $("a[data-gallery^='prettyPhoto']").prettyPhoto({
	  social_tools: false
	 });

	/*//Countdown js
	$("#countdown").countdown({
			date: "12 november 2014 12:00:00",
			format: "on"
	},

	function() {
			// callback function
	});*/

	// Slider Height
	var slideHeight = $(window).height();
	$('#home-carousel .carousel-inner .item, #home-carousel .video-container').css('height',slideHeight);

	$(window).resize(function(){'use strict',
		$('#home-carousel .carousel-inner .item, #home-carousel .video-container').css('height',slideHeight);
	});

	//backstretch slide for main body
	$.backstretch([ 'assets/slide/bg4.png' ], {fade: 750,duration: 3000});

	// Feature Tab Content
	$('.features-nav li').on('click',function(){'use strict',
		$('.features-nav li').removeClass('active');
		$(this).addClass('active');
	});

	// responsive video
	$(".single-event").fitVids();
});