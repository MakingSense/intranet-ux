// Main scope
(() => {
  'use strict';
  let $wrapper = $('#news-list');
  let filter = '';

  let scrollOptions = {
    onScrollDraw: function ($elem, rows) {
      IN.widgets.news.addArticles($elem, rows, false);
    },
    onDataEnd: function() {
      $news.nextPage();
    }
  }
  const $scroll = $.infiniteScroll($wrapper, scrollOptions);

  let newsOptions = {
    accessToken: CONTENTFUL_ACCESS_TOKEN,
    space: CONTENTFUL_SPACE_ID,
    sync: true,
    syncDelay: 10000,
    query: {
      content_type: 'news',
      order: '-sys.updatedAt',
      limit: 100
    },
    onInit: (data) => {
      if (!filter) {
        $scroll.setData(data);
        relativeDates();
      }
    },
    onFirstRequest: (data) => {
      if (!filter) {
        $scroll.setData(data);
        relativeDates();
      }
    },
    onNewPage: function (entries, data) {
      $scroll.appendData(data);
    },
    onSyncNewData: (rows, data) => {
      if (!filter) {
        IN.widgets.news.addArticles($wrapper, rows);
        IN.widgets.news.notificate(rows);
      }
      // Notificate somehow to the user
    }
  }
  if (CONTENTFUL_DEV) {
    options.accessToken = CONTENTFUL_PREVIEW_TOKEN;
    options.host = 'preview.contentful.com';
  }
  const $news = $.msnews(newsOptions);

  $('#news-filter').change(function () {
    setFilter($(this).val());
  });

  function setFilter(filter) {
    let options = {};
    if (!filter) {
      options = {
        onDataEnd: function () {
          $news
        }
      }
    } else {
      options = {
        onDataEnd: function () {
          $news
        }
      }
    }
  }


  //renderNews($wrapper); // Start by showing the news.

  $.bnotifyEnable();
  //setTimeout(function () { $.bnotify('My Title', { body: 'Aquarium Malenostrum' }); }, 3000);

  $('.linkscroll').linkScroll();
})(); // Main scope

// After loading DOM
$(() => {
  'use strict';

}); // onready