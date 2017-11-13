/**
 * @library MS News
 * @description News for MS Intranet using Contentful
 * @author Marcos Rigoli <rigoli82@gmail.com>
 * @license MIT
 */

;(function(window, document, $, undefined) {
  'use strict';

  var NAMESPACE = 'msnews';

  function Plugin (element, options) {
    this.options = $.extend(true, $.fn[NAMESPACE].defaults, options);
    this.$element = $(element);
  }

  /**
   * Plugin prototype
   * @type {Object}
   * @api public
   */
  Plugin.prototype = {
    constructor: Plugin,
    version: '0.0.9',
    /**
     * Init method
     * @api public
     */
    init: function () {
        // @todo add method logic
    }
    // @todo add methods
  };

  /**
   * jQuery plugin definition
   * @param  {String} [method]
   * @param  {Object} [options]
   * @return {Object}
   * @api public
   */
  $.fn[NAMESPACE] = function (method, options) {
    return this.each(function () {
      var $this = $(this),
        data = $this.data('fn.' + NAMESPACE);
      options = (typeof method === 'object') ? method : options;
      if (!data) {
        $this.data('fn.' + NAMESPACE, (data = new Plugin(this, options)));
      }
      data[(typeof method === 'string') ? method : 'init']();
    });
  };

  /**
   * jQuery plugin defaults
   * @type {Object}
   * @api public
   */
  $.fn[NAMESPACE].defaults = {
    accessToken: null,
    space: null,
    model: 'news'

    // @todo add defaults
  };
  }(this, this.document, this.jQuery));