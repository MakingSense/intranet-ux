/**
 * @library MS InfiniteScroll
 * @description Infinite Scrollling
 * @author Marcos Rigoli <rigoli82@gmail.com>
 * @license MIT
 */

;(function(window, document, $, undefined) {
  'use strict';

  const NAMESPACE = 'msInfiniteScroll';
  const VERSION = '0.0.1';

  $.extend($, {
    msInfiniteScroll: function(options) {
      const self = {};
      const defaults = {
        selector: null,
        data: [],               // Array containing the data
        startingElements: 32,   // How many elements draw on init/reset
        dataStep: 8,            // How many elements are drawn every scroll end proc
        dataEndMargin: 16,       // How many elements left must be in order to ask for more data
        requestOnInit: true,

        onRenderElements: null, // Callback for drawing elements. Params: (jquery container, array_to_draw, total)
        onDataEnd: null,        // Callback on data end, for requesting more data. Params: (current index, total elements)
        onReset: null           // Callback on init/reset
      }
      self.options = $.extend(true, {}, defaults, options);


      // Private vars
      if (self.options.selector) {
        self.$element = $(self.options.selector);
        self.element = self.$element.get(0);
      }
      self._defaults = defaults;
      self._name = NAMESPACE;
      self._data =  self.options.data;
      self._current = 0;
      _init();

      // Plugin content

      // private functions
      function _init() {
        // Detect when scrolled to bottom.
        $(window).on('scroll.' + NAMESPACE, function() {
          let body = document.body;
          let html = document.documentElement;
          let documentHeight = Math.max(body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight);

          if (typeof(self.oldScroll) === 'undefined') self.oldScroll = 0;
          let scrollDown = (window.scrollY - self.oldScroll > 0);
          self.oldScroll = window.scrollY;

          // Detect when half screen is remaining and scrolling down
          if (scrollDown && ($(window).scrollTop() + window.innerHeight * 2 >= documentHeight)) {
            loadMore();
          }
        });
        if (self.options.requestOnInit) {
          reset();
        }
      }

      function reset() {
        self._current = 0;
        if (typeof(self.options.onReset) === 'function') {
           self.options.onReset.call(self, self.$element);
        } else {
          self.$element.html('');
        }
        loadMore(self.options.startingElements);
        $(window).scroll();
        return self;
      }

      // Public functions
      function reInit(options) {
        self.options = $.extend({},  self.options, options);
        self._data =  self.options.data;
        self._current = 0;
        reset();
      }

      function loadMore(qty) {
        if (!qty) qty =  self.options.dataStep;
        let remaining = self._data.length - self._current;
        qty = (qty > remaining) ? remaining : qty;
        if (qty && (typeof(self.options.onRenderElements) === 'function')) {
          let from = self._current;
          let to = from + qty;
          let elems = self._data.slice(from, to);
          self.options.onRenderElements.call(self, self.$element, elems, from, to, self._data);
        }
        self._current += qty;
        remaining -= qty;
        if ((typeof(self.options.onDataEnd) === 'function') && (remaining <=  self.options.dataEndMargin)) {
          self.options.onDataEnd.call(self, self._current, self._data.length);
        }
        return self;
      }

      function getData() {
        return self._data;
      }

      function setData(data) {
        self._data = data;
        return self;
      }

      function appendData(data) {
        if (typeof(data) !== 'array') {
          console.error(NAMESPACE + ': Error adding data. Data must be an array.');
          return self;
        }
        self._data.concat(data);
        return self;
      }

      function destroy() {
        self.$element.off('.' + NAMESPACE);
      }

      return {
        reset: reset,
        reInit: reInit,
        loadMore: loadMore,
        getData: getData,
        setData: setData,
        appendData: appendData,
        destroy: destroy
      };
    }
});
}(this, this.document, this.jQuery));