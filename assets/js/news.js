(function () {
  'use strict';
  let $wrapper = $('.news-list');

  IN.widgets.news = {};

  IN.widgets.news.draw = ($elem, data) => {
    for (let i in data) {
      $elem.append(renderArticle(data[i]));
    }
    return $elem;
  }

  IN.widgets.news.addArticles = ($elem, data) => {
    for (let i in data) {
      $elem.find("[data-id='" + data[i].sys.id + "']").remove();
      $elem.prepend(renderArticle(data[i]));
    }
    return $elem;
  }

  IN.widgets.news.removeArticles = ($elem, data) => {
    for (let i in data) {
      $elem.find("[data-id='" + data[i].sys.id + "']").remove();
    }
    return $elem;
  }

  IN.widgets.news.notificate = (data) => {
    for (let i in data) {
      sendNotification(data[i]);
    }
  }

  let ls_news_data = $.contentfulSync({
    // Connection info
    accessToken: CONTENTFUL_ACCESS_TOKEN,
    space: CONTENTFUL_SPACE_ID,
    interval: CONTENTFUL_REFRESH_INTERVAL,

    lsid: 'news', // id for localstorage
    query: {
      content_type: 'news', // get all news
      'include': 2
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
      IN.widgets.news.draw($wrapper, data);
    }
  });

  if (ls_news_data) IN.widgets.news.draw($wrapper, ls_news_data); // Initial draw with the local storage data // shitty implementation, I know..


  $('.linkscroll').linkScroll();

  return;

  // Functions

  function renderArticle(row) {
    let html = $('#news-template').html();
    for(let field in row.fields) {
      let val = row.fields[field][CONTENTFUL_LANG];
      if (typeof(val) !== 'string') continue;
      html = tplReplace(html, field, val);
    }

    html = tplReplace(html, 'publisher-id', row.fields.publisher[CONTENTFUL_LANG].sys.id);



    if (row.fields.urlLabel && row.fields.url) {
      link = ' - <a href="' + row.fields.url[CONTENTFUL_LANG] + '" target="_blank">' + row.fields.urlLabel[CONTENTFUL_LANG] + '</a>';
    }

    html +=   '<h1>' + row.fields.title[CONTENTFUL_LANG] + link + '</h1>';
    html +=   '<time utc="' + row.sys.updatedAt + '">';
    html += '</article>';
    return html;
  }

  function regexEscape(string) {
    const regex = /[^a-z0-9]/ig;
    return string.replace(regex, "\\$1");
  }

  function tplReplace(tpl, field, val) {
    return tpl.replace('{{' + regexEscape(field) + '}}', val);
  }

  function sendNotification(row) {
    let options = {
      body: row.fields.title[CONTENTFUL_LANG]
    }
    $.bnotify('MSi News', options);
  }
}());