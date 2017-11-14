// Main scope
(() => {
  'use strict';
  let $wrapper = $('#news-list');

  let options = {
    accessToken: CONTENTFUL_ACCESS_TOKEN,
    space: CONTENTFUL_SPACE_ID,
    sync: true,
    syncDelay: 10000,
    query: {
      content_type: 'news',
      order: '-sys.updatedAt'
    },
    onInit: (data) => {
      IN.widgets.news.draw($wrapper, data);
      relativeDates();
    },
    onFirstRequest: (data) => {
      IN.widgets.news.draw($wrapper, data);
      relativeDates();
    },
    onSyncNewData: (rows, data) => {
      IN.widgets.news.addArticles($wrapper, rows);
      //IN.widgets.news.notificate(rows);
    }
  }
  let news = $.msnews(options);
  $.bnotifyEnable();
  //setTimeout(function () { $.bnotify('My Title', { body: 'Aquarium Malenostrum' }); }, 3000);

  $('.linkscroll').linkScroll();
})(); // Main scope

// After loading DOM
$(() => {
  'use strict';

}); // onready
