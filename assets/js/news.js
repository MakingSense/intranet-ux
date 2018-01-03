(function () {
  'use strict';

  IN.widgets.news = {};
  IN.widgets.news.template = $('#news-template').html();
  IN.widgets.news.listSelector = '#news-list';
  IN.widgets.news.$list = $(IN.widgets.news.listSelector);
  IN.widgets.news.unread = [];

  let $elem = IN.widgets.news.$list;

  IN.widgets.news.draw = (data) => {
    $elem.html('');
    for (let i in data) {
      $elem.append(renderArticle(data[i]));
    }
    return $elem;
  }

  IN.widgets.news.addArticles = (data, draw) => {
    if (!Array.isArray(data) || !data.length) return;
    for (let i in data) {
      IN.widgets.news.unread.push(data[i].sys.id);
      if (draw) {
        let html = renderArticle(data[i]);
        $elem.prepend(html);
      }
    }
    IN.widgets.news.notificate(data);
    IN.widgets.news.checkUnread();
    return $elem;
  }

  IN.widgets.news.replaceArticles = (data) => {
    if (!Array.isArray(data) || !data.length) return;
    for (let i in data) {
      let html = renderArticle(data[i]);
      let $old = $elem.find("[news-id='" + data[i].sys.id + "']");
      if ($old) {
        $old.replaceWith(html);
      }
    }
    return $elem;
  }

  IN.widgets.news.appendArticles = (data) => {
    if (!Array.isArray(data) || !data.length) return;
    for (let i in data) {
      let html = renderArticle(data[i], false);
      let $old = $elem.find("[news-id='" + data[i].sys.id + "']");
      if ($old.length) {
        $old.replaceWith(html);
      } else {
        $elem.append(html);
      }
    }
    return $elem;
  }

  IN.widgets.news.removeArticles = (data) => {
    for (let i in data) {
      $elem.find("[news-id='" + data[i].sys.id + "']").slideUp(function () { $(this).remove(); });
    }
    return $elem;
  }

  IN.widgets.news.resetArticles = () => {
    $elem.html('');
    return $elem;
  }

  IN.widgets.news.checkUnread = () => {
    let $nmessages = $('#new-messages');
    let $count = $('.unread-news-count');
    let qty = IN.widgets.news.unread.length;

    if (qty > 99) qty = '99+';
    if (qty) {
      let message = qty + (qty === 1 ? ' new message' : ' new messages');
      $nmessages.html(message);
      $count.html(qty);
    }
    if (qty && !$nmessages.hasClass('active')) {
      $nmessages.addClass('active');
      $count.addClass('active');
    } else {
      $nmessages.removeClass('active');
      $count.removeClass('active');
    }
  }

  IN.widgets.news.notificate = (data) => {
    let message = '';
    if (data.length == 1) {
      let row = data[0];
      let publisher = row.fields.publisher;
      message = publisher.fields.firstNames + ' ' + publisher.fields.lastName + ': ' + row.fields.notificationTitle;
    } else {
      message = data.length + ' new messages';
    }
    sendNotification(message);
  }

  let $stickies = $('.sticky'); // To query te document on start only
  $(window).on('scroll.brandnews, resize.brandnews', function () {
    let vh = getViewportHeight();
    let st = (document.documentElement.scrollTop ?
        document.documentElement.scrollTop :
        document.body.scrollTop);
    let $html = $('html');

    if ($html.hasClass('mobile') && !$html.hasClass('mobile--news')) return;
    $('.news__news.unread').each(function () {
      let $this = $(this);
      let top = $this.closest('.news__list').offset().top;
      if (top >= st && top <= st + vh) {
        showNews($this); // Element entered view
      }
    });

    $stickies.each(function () {
      let $this = $(this);
      let $base = $(this.closest('.sticky-base'));
      if (!$base.length) return;
      if ($base.offset().top <= st) {
        $this.addClass('sticky-docked');
        $this.width($base.width());
      } else {
        $this.removeClass('sticky-docked');
        $this.removeAttr('style');
      }
    });

    return;

    // Functions

    function showNews($elem) {
      let id = $elem.attr('news-id');
      if (id) {
        let i = IN.widgets.news.unread.indexOf(id);
        if (i !== -1) IN.widgets.news.unread.splice(i, 1);
      }
      $elem.slideDown(function () {
        $elem.removeClass('unread');
      });
      IN.widgets.news.checkUnread();
    }

    function getViewportHeight() {
      var height = window.innerHeight; // Safari, Opera
      var mode = document.compatMode;

      if ( (mode || !$.support.boxModel) ) { // IE, Gecko
          height = (mode == 'CSS1Compat') ?
          document.documentElement.clientHeight : // Standards
          document.body.clientHeight; // Quirks
      }

      return height;
    }

  }).scroll();

  return;

  // Functions

  function renderArticle(row, isnew) {
    let html = IN.widgets.news.template;
    traverse(row, false, (path, val) => {
      html = tplReplace(html, path, val);
    });

    let pic = omap(row, 'fields.publisher.fields.profilePic.fields.file.url');
    pic = (pic) ? pic + '?w=40' : '/img/no-avatar.jpg';
    html = tplReplace(html, 'avatar_pic', pic);
    let cssclass = isNew(row.sys.id) ? 'unread' : '';
    html = tplReplace(html, 'class', cssclass);
    html = tplReplace(html, 'html_content', marked(row.fields.content));
    let cat = (row.fields.category) ? 'cat-' + row.fields.category : 'cat-none';
    html = tplReplace(html, 'cat', cat);
    html = tplReplace(html, 'row_id', row.sys.id);
    html = tplReplace(html, 'publisher_id', row.fields.publisher.sys.id);
    html = tplReplace(html, 'date_utc', row.sys.createdAt);
    html = tplReplace(html, 'date_relative', relativeDate(row.sys.createdAt));

    html = html.replace('img-src=', 'src='); // 'img-src' is to avoid procing unwanted image loading on template.
    return html;
  }

  function isNew(id) {
    return IN.widgets.news.unread.indexOf(id) !== -1;
  }

  function sendNotification(message) {
    let options = {
      body: message
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