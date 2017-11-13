
// Making Sense - ontentful sync plugin (ms-contentful).
// Version: 0.1 Pre-alpha
// By: Marcos Rigoli (mrigoli@makingsense.com)
//
// Documentation yet to be done..

(function ($) {
  'use strict';
  const namespace = 'ms-contentful';

  $.extend({
    contentfulSync: (initOptions) => {
      const options = $.extend({}, $.contentfulSync.defaults, initOptions);
      const localdata = dataGet(); // Used for storage data in this variable when localStorage is unaviable

      if (options.datavar) {
        eval(options.datavar + ' = localdata');
      }

      if (!options.accessToken || !options.space) {
        console.error('No connection data for contenful API.');
        return false;
      }

      if (options.lsid && window.localStorage === undefined) {
        options.lsid = false; // No local storage this time my friend...
        console.log('LocalStorage is not supported by the current browser.')
      }

      const client = contentful.createClient({
        accessToken: options.accessToken,
        space: options.space,
      });

      if (typeof(options.onExternalChange) === 'function') {
        $(window).bind(namespace + '.storage', function (e) {
          options.onExternalChange(dataGet());
        });
      }

      initSync();
      return this;

      // Internal Functions
      function initSync() {
        const opts = $.extend({}, options.query || {}, { initial: true });
        client.sync(opts).then((response) => {
          const responseObj = JSON.parse(response.stringifySafe());
          const entries = responseObj.entries;
          dataSet(entries);
          if (typeof(options.onFirstRequest) === 'function') {
            options.onFirstRequest(entries);
          }
          var newsTimer = null;
          var syncToken = response.nextSyncToken;

          var sync = () => {
            const sync_opts = $.extend({}, options.query || {}, { nextSyncToken: syncToken });
            client.sync(sync_opts).then((response) => {
              processSync(response);
              syncToken = response.nextSyncToken;
              setTimeout(sync, options.interval);
            }, (e) => { // On sync error
              console.log('Contentful connection error. Reconnecting...');
              initSync();
            });
          }
          sync();
        }, (e) => { // On main connection error
          console.error('Contentful connection error, please check the connection credentials.');
          return false;
        });
      } // initSync

      function processSync(r) {
        var entries = dataGet();

        if(r.entries.length === 0
          && r.deletedEntries.length === 0) {
          return false;
        }

        let newEntries = [];
        let updatedEntries = [];
        let deletedEntries = [];

        // Checking update elements
        if (r.entries.length) {
          for (let i in r.entries) {
            if (updateEntry(r.entries[i])) {
              updatedEntries.push(r.entries[i]);
            } else {
              addEntry(r.entries[i]);
              newEntries.push(r.entries[i])
            }
          }
        }

        // Checking for deleted elements
        // Note: the sync api will pass deleted elements only when there's no type or content_type specified on the query... ¯\_(ツ)_/¯
        if (r.deletedEntries.length) {
          for (let i in r.deletedEntries) {
            deleteEntry(r.deletedEntries)
            deletedEntries.push(r.deletedEntries[i]);
          }
        }

        // Firing envents
        if (newEntries.length && typeof(options.onNewEntries) === 'function') {
          options.onNewEntries(entries, newEntries);
        }
        if (updatedEntries.length && typeof(options.onUpdateEntries) === 'function') {
          options.onUpdateEntries(entries, updatedEntries);
        }
        if (deletedEntries.length && typeof(options.onDeleteEntries) === 'function') {
          options.onDeleteEntries(entries, deletedEntries);
        }
        if (typeof(options.onUpdate) === 'function') {
          options.onUpdate(entries, newEntries, updatedEntries, deletedEntries);
        }
      } // processSync

      // Following the api behavior, when an item is updated, is moved at the top of the list
      function updateEntry(row) {
        let entries = dataGet();
        let id = row.sys.id;
        for (let i in entries) {
          if (entries[i].sys.id == id) {
            entries.splice(i, 1);
            entries.push(row);
            dataSet(entries);
            return true;
          }
        }
        return false;
      }

      // This doesn't check for duplicates (this function is ment to be called after updateEntry returned false for that entry)
      function addEntry(row) {
        let entries = dataGet();
        entries.push(row);
        dataSet(entries);
        return true;
      }

      function deleteEntry(row) {
        let entries = dataGet();
        let id = row.sys.id;
        entries = entries.filter(function( entry ) {
          return entry.sys.id === id;
        });
        return true;
      }

      function dataSet(data) {
        if (options.lsid) {
          try {
            window.localStorage.setItem(namespace + '-' + options.lsid, JSON.stringify(data));
            localdata = data;
          } catch(e) {
            return false;
          }
        } else {
          localdata = data;
        }
      }

      function dataGet() {
        if (options.lsid) {
          try {
            return JSON.parse(window.localStorage.getItem(namespace + '-' + options.lsid));
          } catch (e) { return false; }
        }
        return localdata;
      }
    } // contentfulSync
  }); // $.extend

  // Default settings
  $.contentfulSync.defaults = {
    datavar: null, // Variable to get data, mostly useful when no localStorage is available
    interval: 10 * 1000 // Default interval: 10 seconds.
  }
}( jQuery ));