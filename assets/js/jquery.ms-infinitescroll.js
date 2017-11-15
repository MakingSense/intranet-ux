
// Making Sense - Widget for infinite scrolling
// Version: 0.1 Pre-alpha
// By: Marcos Rigoli (mrigoli@makingsense.com)
//
// Documentation yet to be done..

;(function ($, window, document, undefined) {
  'use strict';

  var pluginName = 'ms-infinitescroll',
    defaults = {
      data: [],             // Array containing the data
      startingElements: 16,    // How many elements draw on init/reset
      dataStep: 4,          // How many elements are drawn every scroll end proc
      dataEndMargin: 8,     // How many elements left must be in order to ask for more data

      onScrollDraw: null,   // Callback for drawing elements. Params: (jquery container, array_to_draw, total)
      onDataEnd: null,      // Callback on data end, for requesting more data. Params: (current index, total elements)
      onReset: null         // Callback on init/reset
    };

  // The actual plugin constructor
  function Plugin(element, options) {
    this.element = element;
    this.$element = $(this.element);
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this._data = this.settings.data;
    this._current = 0;
    this._init();
  }

  // Avoid Plugin.prototype conflicts
  $.extend(Plugin.prototype, {
    // Private functions
    _init: function () {

      // Detect when scrolled to bottom.
      this.element.addEventListener('scroll.' + pluginName, function() {
        // Detect when half screen is remaining
        if (this.element.scrollTop + this.element.clientHeight * 1.5 >= this.element.scrollHeight) {
          loadMore();
        }
      });
      this.reset();
    },
    reset: function () {
      this._current = 0;
      if (typeof(this.settings.onReset) === 'function') {
        this.settings.onReset.call(this, this.$element);
      } else {
        this.$element.html('');
      }
      this.loadmore(this.settings.startingElements);
      return this;
    },
    // Public functions
    loadmore: function (qty) {
      if (!qty) qty = this.settings.dataStep;
      let remaining = this._data.length - this._current;
      qty = (qty > remaining) ? remaining : qty;
      if (typeof(this.settings.onScrollDraw) !== 'function') {
        console.error(pluginName + ': Missing "onScrollDraw" callback.');
        return this;
      }
      let from = this._current;
      let to = from + qty;
      let elems = this._data.slice(from, to);
      this.settings.onScrollDraw.call(this, this.$element, elems, from, to, this._data);
      this._current += qty;
      remaining -= qty;
      if ((typeof(this.settings.onDataEnd) !== 'function') && (remaining <= this.settings.dataEndMargin)) {
        this.settings.onDataEnd.call(this, this._current, this._data.length);
      }
      return this;
    },
    getData: function () {
      return this._data;
    },
    setData: function (data) {
      if (typeof(data) !== 'array') {
        console.error(pluginName + ': Error setting data. Data must be an array.');
        return this;
      }
      this._data = data;
      this.reset();
      return this;
    },
    appendData: function (data) {
      if (typeof(data) !== 'array') {
        console.error(pluginName + ': Error adding data. Data must be an array.');
        return this;
      }
      this._data.concat(data);
      return this;
    }
  });

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' +
          pluginName, new Plugin(this, options));
      }
    });
  };

})(jQuery, window, document);