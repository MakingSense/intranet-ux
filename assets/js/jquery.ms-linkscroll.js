/**
 * @library MS LinkScroll
 * @description Link an element with the main scroll for parallax effects.
 * @author Marcos Rigoli <rigoli82@gmail.com>
 * @license MIT
 */

(function ($) {
  'use strict';
  const namespace = 'linkscroll';

  $.fn.linkScroll = function(initOptions) {
    initOptions = $.extend({}, $.fn.linkScroll.defaults, initOptions);

    window.myscroll = $(window).scrollTop();

    function normalizeWheelSpeed(event) {
      var normalized;
      if (event.wheelDelta) {
          normalized = (event.wheelDelta % 120 - 0) == -0 ? event.wheelDelta / 120 : event.wheelDelta / 12;
      } else {
          var rawAmmount = event.deltaY ? event.deltaY : event.detail;
          normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
      }
      return normalized;
    }

    function scrollAnimate() {
      if (window.smoothScrollTimer) return false;
      window.smoothScrollTimer = setInterval(function () {
        let delta = window.myscroll - window.scrollY;
        let step = 0;
        let reduction = 25;
        if (delta == 0) {
          clearInterval(window.smoothScrollTimer);
          window.smoothScrollTimer = false;
          return;
        } else if (Math.abs(delta) < 1) {
          step = window.myscroll;
        } else {
          step = window.scrollY + (delta > 0 ? Math.ceil(delta / reduction) : Math.floor(delta / reduction));
        }
        window.scrollTo(0, step);
      }, 0);
    }

    $(window)
    .off('mousewheel.linkscroll DOMMouseScroll.linkscroll')
    .on('mousewheel.linkscroll DOMMouseScroll.linkscroll', function(e) {
      e.preventDefault();

      // FixMe
      if (!window.smoothScrollTimer) {
        window.myscroll = $(window).scrollTop();
      }

      let oe = e.originalEvent;
      let delta = normalizeWheelSpeed(oe);
      let body = document.body;
      let html = document.documentElement;
      let documentHeight = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);
      let maxScroll = documentHeight - window.innerHeight;
      window.myscroll -= delta * initOptions.scrollScale;
        //console.log(window.myscroll);
      if (window.myscroll < 0) {
        window.myscroll = 0;
      } else if (window.myscroll > maxScroll) {
        window.myscroll = maxScroll;
      }
      scrollAnimate();
    });

    return this.each(function() {
      let $this = $(this);
      let $wrapper = $this.parent(); // offset()
      var options = extendOptions($this, initOptions);
      let l0 = $wrapper.offset().top;
      let pos = 0;

      $this.addClass('linkscroll-linked');
      $wrapper.addClass('linkscroll-wrapper');
      $this.css('top', l0 + 'px');

      return bind();

      function bind() {
        let last = 0;

        $(window).on('scroll.linkscroll resize.linkscroll', function(e) {
          let current = $(window).scrollTop();
          let diff = current - last;
          last = current;

          let l0 = $wrapper.offset().top;
          let top = $this.position().top;
          let offset = diff * options.scrollRatio;
          let pos = 0;

          if (offset > 0) {
            /*
            if (top - offset + $this.outerHeight() < window.innerHeight) {
              pos = window.innerHeight - $this.outerHeight();
            } else {
              pos = top - offset;
            }
            */
            pos = top - offset;
          } else {
            if (current === 0) {
              pos = l0
            } if (top - offset > l0) {
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
        let opts = Object.assign({}, options); // Cloning options object for different iterations
        for (var p in data) {
          if (data.hasOwnProperty(p) && re.test(p)) {
            let prop = p[namespace.length].toLowerCase() + p.substr(namespace.length + 1);
            opts[prop] = data[p];
          }
        }
        return opts;
      }
    });
  }

  $.fn.linkScroll.defaults = {
    scrollRatio: 0.8,
    scrollScale: 30
  }
}( jQuery ));