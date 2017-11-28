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
    syncDelay: 5000,
    query: {
      orderby: 'sys.updatedAt', // Field to order by
      order: 'DESC',            // ASC or DESC
      include: 10,              // Resolve links depth (max: 10)
      content_type: 'news'      // Contentful model type
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

  $('#newmessages').click(function (e) {
    e.preventDefault();
    $('#news-filter').val('default').change();
    $(window).scrollTop(0);
  });

  function setFilter(val) {
    if (!val) val = 'default';
    filter = val;
    if (typeof(setFilter.filters) === 'undefined') setFilter.filters = {};
    $('html,body').scrollTop(0);

    if (typeof(setFilter.filters[filter]) === 'undefined') {
      if (val === 'default') {
        $news.setQuery(filter, {});
        $news.sync(filter, function (result, data, first) {
          if (first) {
            $scroll.setData(data);
            $scroll.reset();
          } else {
            IN.widgets.news.replaceArticles(result.updated);
            let draw = (filter === 'default');
            IN.widgets.news.addArticles($wrapper, result.new, draw);
            $(window).scroll();
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
        $news.query(val, { 'sys.createdAt[lt]': f }, function (data) {
          $scroll.setData(data);
          $scroll.reset();
        });
      }
      setFilter.filters[filter] = true;
    }

    let data = $news.getData(val);
    $scroll.setData(data);
    $scroll.reset();
  }

  // Checking filters
  $news.query('filters', { orderby: 'sys.createdAt', order: 'ASC', limit: 1 }, function (elem) {
    if (!elem.length) return false;
    let $filter = $('#news-filter');
    let laststr = omap(elem[0], 'sys.createdAt');
    let oldest = new Date(omap(elem[0], 'sys.createdAt'));
    let now = new Date();
    let mdiff = monthDiff(oldest, now);
    if (mdiff < 1) return false; // no filter needed
    let display_format = (mdiff > 11) ? 'MMMM YYYY' : 'MMMM';
    let wdate = moment();
    for (let i=1;i<=mdiff; i++) {
      wdate.subtract(1, 'month');
      $filter.append('<option value="' + wdate.format('YYYY-MM') + '">' + wdate.format(display_format) + '</option>');
    }
    $filter.fadeIn();
  });

  $.bnotifyEnable();
  //setTimeout(function () { $.bnotify('My Title', { body: 'Aquarium Malenostrum' }); }, 3000);

  //$('.linkscroll').linkScroll();
})(); // Main scope

// After loading DOM
$(() => {
  'use strict';

}); // onready


// Function which allows to navigate an object properties by a string
function omap(obj, map) {
  let walker = obj;
  var arr = map.split(".");
  while(arr.length && walker) {
    walker = walker[arr.shift()];
    if (typeof(walker) === 'undefined') return null;
  }
  return walker;
}

function monthDiff(d1, d2) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}