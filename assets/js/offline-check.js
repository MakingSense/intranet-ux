$(() => {
  function updateOnlineStatus() {
    $('html').toggleClass('offline', !navigator.onLine)
  }
  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
});