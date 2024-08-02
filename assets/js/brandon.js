var Brandon = (function($) {

	var init = function() {

		// preload functionality
		if(typeof Loader !== 'undefined') {
			Loader.preload('body', '.percent', function() { 
				$('body').removeClass('loading');
				$('.loader').delay(500).fadeOut(1000);
				setTimeout(function() {
					$('body').addClass('loaded');
				}, 500);
			})
		}

		if(typeof Navigation !== 'Navigation') 
			Navigation.init();

		// Parallax Functionality
		if ($.fn.Parallax && !Modernizr.appleios) {
			$('.asteroid-main').Parallax({ property:'translateY', speed:0.10, start:0, delay:-800 });
			$('.asteroid-1').Parallax({ property:'translateY', speed:-0.14, start:0, delay:-800 });
			$('.asteroid-2').Parallax({ property:'translateY', speed:0.30, start:0, delay:-800 });
			$('.about .scroll').Parallax({ property:'translateY', speed:0.10, start:0, delay:-800 });
			$('.profile').Parallax({ property:'translateY', speed:-0.05, start:0, delay:-800 });
			$('.interests .scroll').Parallax({ property:'translateY', speed:0.10, start:0, delay:-800 });
			$('.line-x-parallax').Parallax({ property:'translateY', speed:-0.20, start:0, delay:-800 });
		}

		// handle the lack of SVG support
		if(!Modernizr.svg) {
			
			$('img[src*="svg"]').attr('src', function() {
				return $(this).attr('src').replace('.svg', '.png');
			});
		
		} else {

			// replace svg with svg code
			jQuery('img.svg-raw').each(function(){
	            var $img = jQuery(this);
	            var imgID = $img.attr('id');
	            var imgClass = $img.attr('class');
	            var imgURL = $img.attr('src');

	            jQuery.get(imgURL, function(data) {
	                // Get the SVG tag, ignore the rest
	                var $svg = jQuery(data).find('svg');

	                // Add replaced image's ID to the new SVG
	                if(typeof imgID !== 'undefined') {
	                    $svg = $svg.attr('id', imgID);
	                }
	                // Add replaced image's classes to the new SVG
	                if(typeof imgClass !== 'undefined') {
	                    $svg = $svg.attr('class', imgClass+' replaced-svg');
	                }

	                // Remove any invalid XML tags as per http://validator.w3.org
	                $svg = $svg.removeAttr('xmlns:a');

	                // Replace image with new SVG
	                $img.replaceWith($svg);

	            }, 'xml');

	        });

		}

		// handle body click
		$(document).mouseup(function(e) {
		    if (!$('.on-hold').is(e.target) && !$('a').is(e.target) && $('.on-hold').has(e.target).length === 0) {
		    	if($('.always-on').hasClass('always-on-active')) toggleOn();
		    }
		});

	};

	var scrollTo = function(id) {
		
		// Stop any currently active scroll
		$('html, body').dequeue();
		// Scroll to #id offset by 90 pixels
		$('html, body').animate({ scrollTop: $(id).offset().top }, 1000, 'easeOutExpo');
	
	};

	var toggleOn = function() {

		$('.always-on').toggleClass('always-on-active');

	}

	var setNav = function(index) {

		$('.navigation a').removeClass('active');
		$('.navigation a').eq(index).addClass('active');

	};
	
	return {
		init: init,
		toggleOn: toggleOn,
		scrollTo: scrollTo
	};

}(jQuery));

$(function() {
	Brandon.init();
});