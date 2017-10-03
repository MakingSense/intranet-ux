
// JS Config file

// Contentful config
const CONTENTFUL_ACCESS_TOKEN = 'a574f6de2196be1622f0402c3c71211101c0b97a31f7db73d4c53b893fd6d854';
const CONTENTFUL_SPACE_ID = '664c1zng04o0';
const CONTENTFUL_LANG = 'en-US';
const CONTENTFUL_REFRESH_INTERVAL = 5 * 1000; // 5 seconds

// Browser notification defaults
$.bnotify.blurOnly = true; // Use notifications only when the page is not active.
$.bnotify.defaults = {
  badge: '/img/notification-icon.png', // MSi badge as default for all notifications.
  icon: '/img/notification-icon.png' // MSi icon as default for all notifications.
};