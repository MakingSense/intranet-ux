
// JS Config file

// Contentful config
const CONTENTFUL_ACCESS_TOKEN = 'a574f6de2196be1622f0402c3c71211101c0b97a31f7db73d4c53b893fd6d854'; // Prod
const CONTENTFUL_PREVIEW_TOKEN = '46997e36c8daad9bed0fa2783bbfdb96ad9961cadfcaf9df9d7fbcc5ecd8767c'; // Preview
const CONTENTFUL_SPACE_ID = '664c1zng04o0';
const CONTENTFUL_LANG = 'en-US';
const CONTENTFUL_REFRESH_INTERVAL = 5 * 1000; // 5 seconds
const CONTENTFUL_DEV = false;
const SW_ENABLED = true;

var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

// Browser notification defaults
$.bnotify.blurOnly = false; // Use notifications only when the page is not active.
$.bnotify.defaults = {
  badge: '/img/notification-icon.png', // MSi badge as default for all notifications.
  icon: '/img/notification-icon.png' // MSi icon as default for all notifications.
};