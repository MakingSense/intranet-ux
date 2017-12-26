// Intranet Service Worker
// Version: 0.0.1
var CACHE_NAME = 'intranet-cache-v1';
var DEBUG = true;
var urlsToCache = [
  '/img/image-placeholder.png'
];

self.addEventListener('install', (event) => {
  // Perform install steps
  DEBUG && console.log('SW Installed.');
});

self.addEventListener('activate', (event) => {
  DEBUG && console.log('New SW activated. Clearing old cache.');
  // On new Service Worker activation, clear all cache.
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
        })
      );
    }).then(() => {
      caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      });
    })
  );
});

// Original code from https://github.com/mdn/sw-test
self.addEventListener('fetch', function(event) {
  let url = event.request.url;
  let is_contentful = url.indexOf('contentful.com') !== -1;
  let is_contentful_img = url.indexOf('images.contentful.com') !== -1;
  // If its a request from contentful, only cache images.
  if (is_contentful && !is_contentful_img) return;
  event.respondWith(caches.match(event.request).then(function(response) {
    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        let responseClone = response.clone();
        // This Regex checks if this is a valid http(s) request.
        let re = /^(https?\:\/\/|\/\/)/i;
        // We can't cache POST requests or extension requests (i.e: chrome-extension://somefile.js).
        if (event.request.method !== 'POST' && event.request.url.match(re)) {
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(function () {
        if (is_contentful_img) {
          // If the resource is a Contentful image, and we don't have it in the cache, we return a placeholder.
          return caches.match('/img/image-placeholder.png');
        } else {
          return null;
        }
      });
    }
  }));
});
