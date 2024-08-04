var Loader = (function($) {

	var items = new Array();
	var $element, $percent_element;
	var current = 0;

	var preload = function(element, percent_element, callback) {

		// cache selectors
		$element = $(element);
		$percent_element = $(percent_element);

		// grab all images in element
		items = getImages();

		// load each image
		for(var i = 0; i < items.length; i++) {
			
			var imgLoad = new Image();
			$(imgLoad).load(function() {

				updatePercent(callback);

			}).attr('src', items[i]);
			
		}

	};

	var updatePercent = function(callback) {

		// add one to current
		setTimeout(function() {
			
			current++;

			var loadPercent = Math.round((current / items.length) * 10000);

			$percent_element.html(zeroPad(loadPercent,5));

			// execute callback
			if(current == items.length) callback();

		}, 250);

	};

	var getImages = function() {
		
		$element.find('*:not(script)').each(function() {
			
			var url = "";
			if ($(this).css('background-image').indexOf('none') == -1) {
			
				url = $(this).css('background-image');
				if(url.indexOf('url') != -1) {
					var temp = url.match(/url\((.*?)\)/);
					url = temp[1].replace(/\"/g, '');
				}
			
			} else 
			if($(this).get(0).nodeName.toLowerCase() == 'img' && typeof($(this).attr('src')) != 'undefined') {
				url = $(this).attr('src');
			}
			
			if (url.length > 0) {
				items.push(url);
			}

		});

		return items;

	}

	function zeroPad(num, places) {
		var zero = places - num.toString().length + 1;
		return Array(+(zero > 0 && zero)).join("0") + num;
	}

	return {
		preload: preload
	};

}(jQuery));