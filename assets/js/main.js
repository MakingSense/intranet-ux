// Main scope
(() => {
  'use strict';
  const wrapperSelector = '#news-list';
  const $wrapper = $(wrapperSelector);
  let $scroll = {};
  let $news = {};
  let filter = false;

  let newsOptions = {
    contentfulToken: CONTENTFUL_ACCESS_TOKEN,
    contentfulSpace: CONTENTFUL_SPACE_ID,
    sync: true,
    syncDelay: 10000,
    query: {
      orderby: 'sys.updatedAt', // Field to order by
      order: 'DESC',            // ASC or DESC
      include: 10               // Resolve links depth (max: 10)
    },
    onInit: function(data) {
      let options = {
        selector: wrapperSelector,
        data: data,
        requestOnInit: false,
        onRenderElements: function ($elem, rows) {
          IN.widgets.news.appendArticles($elem, rows);
        },
        onDataEnd: function() {
          if (filter) {
            $news.nextPage(filter, function (entries, data) {
              if (entries.length) {
                $scroll.appendData(data);
                $('.news--loading').show();
                $('.news--nodata').hide();
              } else {
                // Reached the end
                $('.news--loading').hide();
                $('.news--nodata').show();
              }
            });
          }
        }
      }
      $scroll = $.msInfiniteScroll(options);
    },
    onQuery: function() {
      $('.news--loading').show();
      $('.news--nodata').hide();
    }
  }
  if (CONTENTFUL_DEV) {
    newsOptions.contentfulToken = CONTENTFUL_PREVIEW_TOKEN;
    newsOptions.host = 'preview.contentful.com';
  }
  $news = $.msNews(newsOptions);

  $('#news-filter').change(function () {
    setFilter($(this).val());
  }).change();

  function setFilter(val) {
    if (!val) val = 'default';
    filter = val;
    if (typeof(setFilter.filters) === 'undefined') setFilter.filters = {};
    $('html,body').scrollTop(0);

    if (typeof(setFilter.filters[filter]) === 'undefined') {
      if (val === 'default') {
        $news.setQuery(filter, {});
        $news.sync(filter, function (entries, data, first) {
          if (first) {
            $scroll.setData(data);
            $scroll.reset();
          } else {
            console.log('New data!', entries);
          }
        });
      } else {
        let temp = val.split('-');
        let yy = parseInt(temp[0]);
        let mm = parseInt(temp[1]) + 1;
        if (mm > 12) {
          yy++;
          mm = '01';
        } else if (mm < 10) {
          mm = '0' + mm;
        }
        let f = yy + '-' + mm + '-01T00:00:00.000Z';
        f = '2017-01-01T00:00:00.000Z';
        $news.query(val, { 'sys.createdAt[lt]': f }, function (data) {
          $scroll.setData(data);
          $scroll.reset();
        });
      }
      setFilter.filters[filter] = true;
      return;
    }

    let data = $news.getData(val);
    $scroll.setData(data);
    $scroll.reset();
  }

  $.bnotifyEnable();
  //setTimeout(function () { $.bnotify('My Title', { body: 'Aquarium Malenostrum' }); }, 3000);

  //$('.linkscroll').linkScroll();
})(); // Main scope

// After loading DOM
$(() => {
  'use strict';

}); // onready