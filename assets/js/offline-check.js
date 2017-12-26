$(() => {
  if (typeof(navigator) !== 'undefined') {
    function updateOnlineStatus() {
      let online = navigator.onLine;
      $('html').toggleClass('offline', !online);
      if (online) {
        checkWeather();
      }
    }
    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  } else {
    // Navigator object not available, assuming it's connected.
    checkWeather();
  }
});