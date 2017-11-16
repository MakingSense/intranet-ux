// Main scope
(() => {
  'use strict';
  let $wrapper = $('#news-list');
  let $scroll = {};
  let filter = '';

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
      let options = {
        data: data,
        onScrollDraw: function ($elem, rows) {
          IN.widgets.news.addArticles($elem, rows, false);
        },
        onDataEnd: function() {
          $news.nextPage(filter, function (entries, data) {
            $scroll.appendData(data);
          });
        }
      }
      $scroll = $.infiniteScroll($wrapper, options);
    },
    /*
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
    */
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
    if (!filter) filter = 'default';
    if (typeof(this.filters) === 'undefined') this.filters = {};
    $('html,body').scrollTop(0);

    if (typeof(this.filters[filter]) === 'undefined') {
      if (filter === 'default') {
        $news.setQuery(filter, {});
      } else {
        temp = filter.split('-');
        let yy = temp[0];
        let mm = temp[1] + 1;
        if (mm > 12) {
          yy++;
          mm = 1;
        }
        let f = yy + '-' + mm + '-01';
        $news.setQuery(filter, { 'sys.updatedAt[lt]': f });
      }

      let data = $news.getData(filters);
      $scroll.setData(data).reInit();
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