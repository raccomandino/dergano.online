(function($){

	$.fn.Parallax = function(options) {

		// cache selector
		var obj = $(this);

		// merge defaults with custom vars
		options = $.extend({}, $.fn.Parallax.defaults, options);
		options.startPos = obj.offset().top + options.delay;
		options.endPos = options.startPos + options.duration;

		// initital screen size
		setScreen();

		// bind scroll event to update position
		$(window).bind('scroll', updatePosition);

		// listen for screen resize
		$(window).resize(setScreen);

		// check screen size
		function setScreen() {

			if($(window).width() < 961) {
				options.disable = true;
				obj.removeAttr('style');
			} else {
				options.disable = false;
				updatePosition();
			}

		}

		// update element position
		function updatePosition() {
			
			if(options.disable) return false;

			var scrollTop = $(window).scrollTop();

			doTransformParallax(scrollTop);

		}

		function doTransformParallax(scrollTop) {

			if(scrollTop > options.startPos) {
				
				obj.css('transform', 'translate3d(0,' + getPosition() + 'px,0)');
			
			} else {
				
				obj.css('transform', 'translate3d(0,' + getPosition() + 'px,0)');
			
			}

		}

		// get new position
		function getPosition() {
	
			// Calculate new position based on speed / scroll position / start position
			return ($(window).scrollTop() * options.speed) - (options.startPos * options.speed) + options.start;

		};

		function getEndPosition() {
			return (options.endPos * options.speed) - (options.startPos * options.speed) + options.start;
		}

		return obj.each(function(){

			updatePosition();

		});

	}

	$.fn.Parallax.defaults = {
		disable: false,
		property:'top', 
		speed:0.2, 
		start:0, 
		delay:0,
		duration:2500
	}; 


})(jQuery);
