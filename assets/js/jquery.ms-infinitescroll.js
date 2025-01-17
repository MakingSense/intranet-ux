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
        scroller: null,         // Element to scroll, if null then considers the window
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
      if (!self.options.scroller) self.options.scroller = 'window';
      if (self.options.scroller === 'window') {
        self.$scroller = $(window);
      } else {
        self.$scroller = $(self.options.scroller);
        if (!self.$scroller.length) {
          console.error(NAMESPACE + ': Cannot match any element with the query "' + self.options.scroller + '".');
          return false;
        }
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
        self.$scroller.on('scroll.' + NAMESPACE, function() {
          let totalHeight = 0;
          let height = 0;
          let scrollTop = 0;
          if (self.options.scroller !== 'window') {
            totalHeight = self.$scroller.get(0).scrollHeight;
            height = self.$scroller.height();
            scrollTop = self.$scroller.scrollTop();
          } else {
            let body = document.body;
            let html = document.documentElement;
            totalHeight = Math.max(body.scrollHeight, body.offsetHeight,
              html.clientHeight, html.scrollHeight, html.offsetHeight);
            height = window.innerHeight;
            scrollTop = window.scrollY;
          }
          if (typeof(self.oldScroll) === 'undefined') self.oldScroll = 0;
          let scrollDown = (scrollTop - self.oldScroll > 0);
          self.oldScroll = scrollTop;
          // Detect when half element is remaining and scrolling down
          if (scrollDown && (scrollTop + height * 2 >= totalHeight)) {
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
           self.options.onReset.call(self);
        }
        loadMore(self.options.startingElements);
        self.$scroller.scroll();
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
          self.options.onRenderElements.call(self, elems, from, to, self._data);
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
        self.$scroller.off('.' + NAMESPACE);
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
