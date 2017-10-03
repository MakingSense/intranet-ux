
// Making Sense - Browser Notify plugin (ms-bnotify).
// Version: 0.1 Pre-alpha
// By: Marcos Rigoli (mrigoli@makingsense.com)
// What it does: It simplifies handling web notifications. It also adds classes to <html> tag to indicate the notification status:
// Classes:
// - notifications--default: Default status, the user didn't make a decision yet
// - notifications--granted: The user enabled notifications for the site
// - notifications--denied: The user denied notifications for the site
// - notifications--unavailable: The browser does not support notifications
//
// if onClick is set and returns false, cancels the page focus when clicking the notification.


(($) => {
  'use strict';
  $.extend({
    bnotify: (title, initOptions, onClick, show) => {
      // Notification defaults
      const options = $.extend({}, $.bnotify.defaults, initOptions);
      // If the blurOnly option is enabled, the notification will output only when the tab is unactive. Unles is overrided by the show param.
      let prompt = (typeof(show) !== 'undefined') ? !!show : !($.bnotify.blurOnly && !document.hidden);
      if (!prompt) return false;
      if (!window.Notification) return false; // Check browser support
      if (!$.bnotify.enabled) return false; // Notifications disabled by plugin config
      let send = (($.bnotify.forceConfirmation && Notification.permission !== 'denied')
              || (!$.bnotify.forceConfirmation && Notification.permission === 'granted'));
      if (send) {
        Notification.requestPermission((status) => { // Request permission for notifications
          _updateStatus(); // Update notifications status
          if (status !== 'granted') return; // If the user does not allow notifications, aboort.
          let n = new Notification(title, options);
          n.addEventListener('click', () => {
            let focus = true;
            if (typeof(onClick) === 'function') focus = onClick();
            if (focus !== false) window.focus(); // This is for controlling the focus
          });
        });
      }
    }, // bnotify
    bnotifyEnable: () => { // Request the user for enabling notifications.
      if (!window.Notification) return false;
      Notification.requestPermission(() => {
        _updateStatus();
      });
    } // bnotifyEnable
  }); // $.extend

  // Private functions
  function _updateStatus() {
    // Remove notification status indicators
    $('html').removeClass ((index, className) => {
      return (className.match (/notifications--\S+/g) || []).join(' ');
    });
    // Add status indictor
    if (window.Notification) {
      $('html').addClass('notifications--' + Notification.permission);
    } else {
      $('html').addClass('notifications--unavailable');
      console.error('This browser does not support system notifications.');
    }
    // Run callback (if provided) with current state as argument
    if (typeof($.bnotify.onUpdate) === 'function') $.bnotify.onUpdate(Notification.permission);
  } // _updateStatus

  // Plugin init

  // Plugin defaults
  $.bnotify.defaults = {};
  // This is for manually enabling/disabling notifications
  $.bnotify.enabled = true;
  // Setting for displaying notifications only when the window is not active.
  $.bnotify.blurOnly = true;
  // Force confirmation if needed when sending a new Notification (as long as is not denied). Otherwise if they are not enabled, the notification will be simply ignred.
  $.bnotify.forceConfirmation = false;
  // Callback to proc on update
  $.bnotify.onUpdate = null;

  // Detect notification status
  _updateStatus();
})( jQuery );