$(() => {
  'use strict';
  let location = 466863; // Default woeid: mar del plata

  if ("geolocation" in navigator) {
    $('.js-geolocation').show();
  } else {
    $('.js-geolocation').hide();
  }

  $("#header").on('click', '#weather', function () {
    navigator.geolocation.getCurrentPosition(function(p) {
      location = p.coords.latitude + ',' + p.coords.longitude;
      loadWeather(location);
      $('.js-geolocation').fadeOut();
    }, function (p) {
      // Oh, bugga...
    });
  });

  let refreshWeather = setInterval(() => {
    loadWeather(location);
  }, 1000 * 60 * 1); // 1 minute

  loadWeather(location); // Initial load
});


function loadWeather(query) {
  if (!query) return false;

  let options = {
    unit: 'c',
    success: function(weather) {
      let hint = weather.city + "\r\n" + weather.currently + ' - ' + weather.temp + '&deg; ' + weather.units.temp;
      let html = '';
      html += '<div id="weather" class="weather" title="' + hint + '">';
      html +=   '<div class="weather__tile weather__icon"><i class="icon-' + weather.code + '"></i></div>';
      html +=   '<div class="weather__tile weather__temp">' + weather.temp + '&deg;</div>';
      html += '</div>';
      $('#weather').remove();
      $("#header").prepend(html);
    },
    error: function(e) {
      console.error('Error in weather widget: ' + e);
    }
  };

  if (typeof(query) === 'number') {
    options.woeid = query;
  } else {
    options.location = query;
  }

  $.simpleWeather(options);

}
