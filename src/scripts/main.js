
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "dbpediaAutosuggest",
				defaults = {
				propertyName: "value"
		};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				//the input field designated as the search box
				this.element = element;

				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don't want to alter the default options for
				// future instances of the plugin
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		Plugin.prototype = {
				init: function () {
					//create the div used to display the results
					this.$results = $("<div class='dbpedia-autosuggest'></div>").appendTo('body');
					this.monitorInput();
					this.dismissOnOutsideClick();
				},
				monitorInput: function () {
					var _this = this;

					$(this.element).on('focus', function (e) {
						_this.positionPane();
						_this.$results
							.empty('.status')
							.prepend("<div class='status'>Start typing to get some suggestions...</div>")
					});

					// $(this.element).on('blur', function (e) {
					// 	_this.positionPane();
					// 	_this.$results.empty()
					// });

					$(this.element).on('keyup', function (e) {
						
						if (_this.searchThrottle) {
							//there is an existing throttle...clear it out before setting a new one
							clearTimeout(_this.searchThrottle);
							_this.searchThrottle = null;
						}

						_this.searchThrottle = setTimeout(function () {
							_this.executeSearch($(_this.element).val());
						}, 250);
					});
				},
				executeSearch: function (term) {
					var _this = this;
					var url = "http://lookup.dbpedia.org/api/search/PrefixSearch?QueryClass=&MaxHits=10&QueryString=" + term;
					var options = {
						url: url,
						headers: { "Accept": "application/json" }
					};

					this.positionPane();
					this.$results
						.empty('.status')
						.prepend("<div class='status'>Searching...</div>")
					
					$.ajax(options).then(function (response) {
						_this.$results.empty('.status');
						_this.displayResults(response.results);
					});
				},
				displayResults: function (results) {
					var _this = this;
					this.positionPane();

					if(!results.length){
						this.$results
						.off('click', 'li')
						.empty()
						.append("<div class='status'>No Suggestions</div>")
						return;
					}

					var $list = $("<ul/>");

					for (var i = 0; i < results.length; i++) {
						var classes = results[i].classes;
						var type = classes && classes.length ? classes[0].label : ""
						var label = results[i].label;
						$("<li>" + label + "<br/><i>" + type + "</i></li>")
							.data('dbpedia-result', results[i])
							.appendTo($list);
					}

					this.$results
						.off('click', 'li')
						.empty()
						.append($list)
						.on('click', 'li', function () {
							var data = $(this).data('dbpedia-result');
							$(_this.element).trigger('dbpedia.select', data);
						});
				},
				positionPane: function () {
					//we want the offset - this position relative to the document
					var position = $(this.element).offset();
					//adjust for the height of the input field
					position.top += $(this.element).outerHeight();

					this.$results.css("position", "absolute").css(position);
				},
				dismissPane: function () {
					this.$results.css('display', 'none');
				},
				dismissOnOutsideClick: function () {
					var _this = this;
					var $pane = _this.$results;
					var $input = $(_this.element);
					$('body').on('click', function (e) {
						var actionInPane = $pane.is(e.target) || $.contains($pane[0], e.target);
						var inputClick = $input.is(e.target);
						if(!actionInPane && !inputClick)
						{
							_this.$results.empty()
						}
					});
				}
		};

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});

				// chain jQuery functions
				return this;
		};
		
})( jQuery, window, document );