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
    },


  }
  let news = $.msnews(options);

  console.log(news.getData());


/*
  const client = contentful.createClient({
    accessToken: CONTENTFUL_ACCESS_TOKEN,
    space: CONTENTFUL_SPACE_ID,
  });

  client.getEntries({
    content_type: 'news',
    include: 2,
    order: 'sys.createdAt'
  })
  .then(function (entries) {
      entries.items.forEach(function (news) {
        console.log('News:' + news.fields.content);
        let publisher = news.fields.publisher;
        console.log('Publisher:' + publisher.fields.firstNames + ' ' + publisher.fields.lastName);
        let asset = publisher.fields.profilePic;
        console.log('Pub. Pic: ' + asset.fields.file.url);
      });

      console.log(entries);
  });

  return false;

  /*
  // Sync staff
  $.contentfulSync({
    // Connection info
    accessToken: CONTENTFUL_ACCESS_TOKEN,
    space: CONTENTFUL_SPACE_ID,
    interval: CONTENTFUL_REFRESH_INTERVAL,

    lsid: 'staff', // id for localstorage
    datavar: 'IN.widgets.staff.data',
    query: {
      content_type: 'staff', // get all stff
      include: 1
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

  // Sync news
  $.contentfulSync({
    // Connection info
    accessToken: CONTENTFUL_ACCESS_TOKEN,
    space: CONTENTFUL_SPACE_ID,
    interval: CONTENTFUL_REFRESH_INTERVAL,

    lsid: 'news', // id for localstorage
    datavar: 'IN.widgets.news.data',
    query: {
      content_type: 'news', // get all news
      include: 1
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

  if (IN.widgets.news.data) IN.widgets.news.draw($wrapper, IN.widgets.news.data); // Initial draw with the local storage data // shitty implementation, I know..

  */


  $.bnotifyEnable();
  //setTimeout(function () { $.bnotify('My Title', { body: 'Aquarium Malenostrum' }); }, 3000);

  $('.linkscroll').linkScroll();
})(); // Main scope

// After loading DOM
$(() => {
  'use strict';

}); // onready
