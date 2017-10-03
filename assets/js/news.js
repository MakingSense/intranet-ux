(function () {
  'use strict';

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

  function renderArticle(row) {
    let html = '';
    html += '<article data-id="' + row.sys.id + '">';
    html +=   '<img src="/img/news-default-pic.png" alt="No pic">';

    let link = '';
    if (row.fields.urlLabel && row.fields.url) {
      link = ' - <a href="' + row.fields.url[CONTENTFUL_LANG] + '" target="_blank">' + row.fields.urlLabel[CONTENTFUL_LANG] + '</a>';
    }

    html +=   '<h1>' + row.fields.title[CONTENTFUL_LANG] + link + '</h1>';
    html +=   '<time utc="' + row.sys.updatedAt + '">';
    html += '</article>';
    return html;
  }

  function sendNotification(row) {
    let options = {
      body: row.fields.title[CONTENTFUL_LANG]
    }
    $.bnotify('MSi News', options);
  }
}());