(function () {
  'use strict';

  IN.widgets.news = {};
  IN.widgets.staff = {};

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

  IN.widgets.staff.data = null; // reference for widget data
  IN.widgets.news.data = null; // reference for widget data

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
    html = tplReplace(html, 'date_utc', row.sys.updatedAt);
    html = tplReplace(html, 'date_relative', relativeDate(row.sys.updatedAt));

    /*
    let publisherid = row.fields.publisher[CONTENTFUL_LANG].sys.id;

    if (publisherid) {
      html = tplReplace(html, 'publisher-id', publisherid);
      let publisher = getRowById(IN.widgets.staff.data, publisherid);
      if (publihser) {
        //html = tplReplace(html, 'avatar_pic', row.sys.updatedAt);
      } else {
        html = tplReplace(html, 'avatar_pic', '/img/publisher-no-avatar.jpg');
      }
    }
    */

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

  function getRowById(rows, id) {
    for (i in rows) {
      let row = rows[i];
      if (row.sys.id === id) return row;
    }
    return false;
  }
}());