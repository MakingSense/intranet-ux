
// Main scope
(() => {
  'use strict';

  let $wrapper = $('.news-list');

  let lsdata = $.contentfulSync({
    // Connection info
    accessToken: CONTENTFUL_ACCESS_TOKEN,
    space: CONTENTFUL_SPACE_ID,
    interval: CONTENTFUL_REFRESH_INTERVAL,

    lsid: 'news', // id for localstorage
    query: {
      content_type: 'news' // get all news
    },

    // Events
    onFirstRequest: (data) => {
      console.log(data);
      IN.widgets.news.draw($wrapper, data);
      relativeDates();
    },
    onNewEntries: (data, rows) => {
      console.log(rows);
      IN.widgets.news.addArticles($wrapper, rows);
      IN.widgets.news.notificate(rows);
    },
    onUpdateEntries: (data, rows) => {
      IN.widgets.news.addArticles($wrapper, rows);
      IN.widgets.news.notificate(rows);
    },
    onDeleteEntries: (data, rows) => {
      console.log('Deleted: ', rows);
    },
    onUpdate: (data, added, updated, deleted) => {
      relativeDates();
    },
    onExternalUpdate: (data) => {
      console.log('ExternalUpdate: ', data);
      drawNews(data);
    }
  });

  if (lsdata) drawNews(lsdata); // Initial draw with the local storage data // shitty implementation, I know..

  //$.bnotifyEnable();
  //setTimeout(function () { $.bnotify('My Title', { body: 'Aquarium Malenostrum' }); }, 3000);
})(); // Main scope

// After loading DOM
$(() => {
  'use strict';

  let rtimesTimer = setInterval(() => {
    relativeDates();
  }, 5000);
  relativeDates();
}); // onready

function relativeDates() {
  $('time').each(function() { // For some reason, "this" is handled differently in arrow functions
    let $this = $(this);
    let utc = $this.attr('utc');
    if (!utc) return;
    let date = new Date(utc);
    let strdate = moment(date).format('LLLL');
    $this
      .html($.timeago(date))
      .attr({
        title: strdate,
        datetime: strdate
      });
  });
}

function drawNews(data) {
  let $container = $('#news-list');

  $container.html('');
  for (let i in data) {
    let row = data[i];
    let $elem = $('<li></li>');
  }
}