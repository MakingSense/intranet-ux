$(() => {
  'use strict';

  if ("geolocation" in navigator) {
    $('.js-geolocation').show();
  } else {
    $('.js-geolocation').hide();
  }

  $(document).ready(function() {
    loadWeather(466863); //@params location, woeid
  });

  $("#header").on('click', '#weather', function () {
    navigator.geolocation.getCurrentPosition(function(p) {
      loadWeather(p.coords.latitude + ',' + p.coords.longitude);
      $('.js-geolocation').fadeOut();
    }, function (p) {
      // Oh, bugga...
    });
  });
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
