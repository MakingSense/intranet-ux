var weatherRefreshTimer = false;
var weatherRefreshTimerInterval = 1000 * 60 * 1; // 1 minute
let gapi = 'AIzaSyCEKD2m2Cf931zleB63ktw0SxK8_O8xT7Q'; // Google API key for geolocation

$(() => {
  'use strict';
  let geolocation = 466863; // Default woeid: mar del plata

  if ("geolocation" in navigator) {
    $('.js-geolocation').show();
  } else {
    $('.js-geolocation').hide();
  }

  $('#weather').click(function () {
    let $this = $(this);
    navigator.geolocation.getCurrentPosition(function(p) {
      geolocation = p.coords.latitude + ',' + p.coords.longitude;
      loadWeather(geolocation).then(() => {
        $('.js-geolocation').fadeOut();
        $this.removeClass('weather--disconnected');
      });
    }, (e) => {
      // Oh, bugga... let's try with Google Maps API
      $.ajax({
        type: 'POST',
        url: 'https://www.googleapis.com/geolocation/v1/geolocate?key=' + gapi,
        dataType: 'json',
        success: function(data){
          geolocation = data.location.lat + ',' + data.location.lng;
          loadWeather(geolocation).then(() => {
            $('.js-geolocation').fadeOut();
            $this.removeClass('weather--disconnected');
          });
        },
        failure: function(errMsg) {
          loadWeather(geolocation).then(() => {
            $this.addClass('weather--disconnected');
            $this.attr('title', '(Click to locate)\n' + $this.attr('title'))
          }); // default
        }
      });
    });
  }).click();
});


function loadWeather(query) {
  if (!query) return false;
  return new Promise((resolve, reject) => {
    let options = {
      unit: 'c',
      success: function(weather) {
        let hint = weather.city + "\r\n" + weather.currently + ' - ' + weather.temp + '° ' + weather.units.temp;
        let html = '';
        html +=   '<div class="weather__tile weather__icon"><i class="icon-' + weather.code + '"></i></div>';
        html +=   '<div class="weather__tile weather__temp">' + weather.temp + '&deg;</div>';
        $('#weather').attr('title', hint);
        $('#weather').html(html);
        if (weatherRefreshTimer) {
          clearInterval(weatherRefreshTimer);
        }
        weatherRefreshTimer = setInterval(() => {
          loadWeather(query);
        }, weatherRefreshTimerInterval);
        resolve(weather);
      },
      error: function(e) {
        reject(e);
      }
    };
    if (typeof(query) === 'number') {
      options.woeid = query;
    } else {
      options.location = query;
    }
    $.simpleWeather(options);
  });
}
