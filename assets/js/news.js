(function () {
  'use strict';

  IN.widgets.news = {};
  IN.widgets.news.template = $('#news-template').html();

  IN.widgets.news.draw = ($elem, data) => {
    $elem.html('');
    for (let i in data) {
      $elem.append(renderArticle(data[i]));
    }
    return $elem;
  }

  IN.widgets.news.addNewArticles = ($elem, data) => {
    for (let i in data) {
      let html = renderArticle(data[i], isnew);
      let $old = $elem.find("[news-id='" + data[i].sys.id + "']");
      if ($old) {
        $old.replaceWith(html);
      } else {
        $elem.prepend(html);
        $elem.find('.new').slideDown(function () {
          $(this).removeClass('new');
        });
      }
    }
    return $elem;
  }

  IN.widgets.news.appendArticles = ($elem, data) => {
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

  IN.widgets.news.removeArticles = ($elem, data) => {
    for (let i in data) {
      console.log('remove: ', data[i].sys.id)
      $elem.find("[news-id='" + data[i].sys.id + "']").slideUp(function () { $(this).remove(); });
    }
    return $elem;
  }

  IN.widgets.news.notificate = (data) => {
    for (let i in data) {
      sendNotification(data[i]);
    }
  }

  return;

  // Functions

  function renderArticle(row, isnew) {
    let html = IN.widgets.news.template;
    traverse(row, false, (path, val) => {
      html = tplReplace(html, path, val);
    });

    let pic = omap(row, 'fields.publisher.fields.profilePic.fields.file.url');
    pic = (pic) ? pic + '?w=40' : '/img/publisher-no-avatar.jpg';
    html = tplReplace(html, 'avatar_pic', pic);
    let newclass = isnew ? 'new unseen' : '';
    html = tplReplace(html, 'new', newclass);
    html = tplReplace(html, 'html_content', marked(row.fields.content));
    let cat = (row.fields.category) ? 'cat-' + row.fields.category : 'cat-none';
    html = tplReplace(html, 'cat', cat);
    html = tplReplace(html, 'row_id', row.sys.id);
    html = tplReplace(html, 'publisher_id', row.fields.publisher.sys.id);
    html = tplReplace(html, 'date_utc', row.sys.updatedAt);
    html = tplReplace(html, 'date_relative', relativeDate(row.sys.updatedAt));
    return html;

    function traverse(obj, path, callback) {
      if(typeof(obj.fields) !== 'undefined') {
          $.each(obj.fields, function(k,v) {
            let newpath = path ? path + '.' + k : k;
            traverse(v, newpath, callback);
          });
      } else {
        callback(path, obj);
      }
    }
  }

  function regexEscape(string) {
    const regex = /([^a-z0-9])/ig;
    return string.replace(regex, "\\$1");
  }

  function tplReplace(tpl, field, val) {
    return tpl.replace('{{' + field + '}}', val);
  }

  function sendNotification(row) {
    let options = {
      body: row.fields.notificationTitle
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