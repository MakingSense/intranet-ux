if(window.navigator && navigator.serviceWorker) {
  ((navigator) => {
    if (SW_ENABLED) {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw').then(function(reg) {
            if(reg.installing) {
              console.log('Service worker installing...');
            } else if(reg.waiting) {
              console.log('Service worker installed.');
            } else if(reg.active) {
              console.log('Service worker active.');
            }
          }, function(err) {
            // Registration failed :(
            console.log('ServiceWorker registration failed: ', err);
          });
        });
      } else {
        console.log('Service workers are not supported.');
      }
    } else {
      // If not enabled, clear any SW.
      if(window.navigator && navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations()
        .then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        });
      }
    }
  })(window.navigator);
}