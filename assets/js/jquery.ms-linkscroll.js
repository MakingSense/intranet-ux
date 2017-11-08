
// Making Sense - Widget for linking the lateral panels with the scroll
// Version: 0.1 Pre-alpha
// By: Marcos Rigoli (mrigoli@makingsense.com)
//
// Documentation yet to be done..

(function ($) {
  'use strict';
  const namespace = 'linkscroll';

  $.fn.linkScroll = function(initOptions) {
    initOptions = $.extend({}, $.fn.linkScroll.defaults, initOptions);

    return this.each(function() {
      let $this = $(this);
      let $wrapper = $this.parent(); // offset()
      const options = extendOptions($this, initOptions);
      let l0 = $wrapper.offset().top;
      let pos = 0;

      $this.addClass('linkscroll-linked');
      $wrapper.addClass('linkscroll-wrapper');
      $this.css('top', l0 + 'px');

      return bind();

      function bind() {
        let last = 0;

        $(window).on('scroll resize', function() {
          let current = $(window).scrollTop();
          let diff = current - last;
          last = current;

          let l0 = $wrapper.offset().top;
          let top = $this.position().top;
          let offset = diff * options.scrollRatio;
          let pos = 0;

          if (offset > 0) {
            if (top - offset + $this.outerHeight() < window.innerHeight) {
              pos = window.innerHeight - $this.outerHeight();
            } else {
              pos = top - offset;
            }
          } else {
            if ((current < l0) || (top - offset > l0)) {
              pos = l0
            } else {
              pos = top - offset;
            }
          }
          $this.css('top', pos + 'px');
        }).scroll(); // Trigger on init
      } // init

      // Functions

      // Extends init options with object options within data
      function extendOptions($object, options) {
        let data = $object.data();
        let re = new RegExp('^' + namespace + '[a-z]+', 'i');
        for (var p in data) {
          console.log(p);
          if (data.hasOwnProperty(p) && re.test(p)) {
            let prop = p[namespace.length].toLowerCase() + p.substr(namespace.length + 1);
            options[prop] = data[p];
          }
        }
        return options;
      }
    });
  }

  $.fn.linkScroll.defaults = {
    scrollRatio: 0.8
  }
}( jQuery ));