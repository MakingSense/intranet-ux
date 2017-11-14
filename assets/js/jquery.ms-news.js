/**
 * @library MS News
 * @description News for MS Intranet using Contentful
 * @author Marcos Rigoli <rigoli82@gmail.com>
 * @license MIT
 */

;(function(window, document, $, undefined) {
  'use strict';

  var NAMESPACE = 'msnews';

  $.extend($, {
    [NAMESPACE]: function(options) {
      var $this = this;
      $this.options = $.extend(true, {
        accessToken: null,  // Contentful Access Token
        space: null,        //Contentful Space
        lsid: NAMESPACE,    // Local Storage ID
        sync: false,         // Keep data synced
        syncDelay: 10000,   // Sync delay
        // Default query
        query: {            // Query default options
          include: 10       // Resolve links depth
        },

        // Callbacks
        onInit: null,         // Callback on init (entries from localstorage)
        onFirstRequest: null, // Callback on first request (newentries)
        onSyncNewData: null,  // Callback on sync. Params (newentries, allentries)
      }, options);

      // Private vars
      $this.localdata = false;
      $this.client = false;
      $this.sync = false;
      $this.syncIntervalHandle = false;
      _init();

      // Plugin content

      // private functions
      function _init() {
        if ($this.options.lsid && window.localStorage === undefined) {
          $this.options.lsid = false; // No local storage $this time my friend...
          console.log('ms-news: LocalStorage is not supported by the current browser.')
        }
        if ($this.options.lsid) {
          $this.localdata = JSON.parse(window.localStorage.getItem(NAMESPACE + '-' + $this.options.lsid));
        }
        if (typeof($this.options.onInit) === 'function') {
          $this.options.onInit.call($this, $this.localdata);
        }
        if (!$this.options.accessToken || !$this.options.space) {
          console.error('ms-news: Missing Contentful connection config.');
          return false;
        }
        $this.client = contentful.createClient({
          accessToken: $this.options.accessToken,
          space: $this.options.space
        });
        if (!$this.client) {
          console.log('ms-news: Unable to load client.');
          return false;
        }
        try {
          $this.client.getEntries($this.options.query).then(function (entries) {
            if ($this.options.sync) {
              startSync();
            }
            if (entries) setData(entries.items);
            if (typeof($this.options.onFirstRequest) === 'function') {
              $this.options.onFirstRequest.call($this, $this.localdata);
            }
          }, function (e) {
            console.log('Contentful connection error:', e.message);
          });
        } catch(e) {}
      }

      function _processSync(entries) {
        if (!entries.length) return;
        addData(entries);
        if (typeof($this.options.onSyncNewData) === 'function') {
          $this.options.onSyncNewData.call($this, entries, $this.localdata);
        }
      }

      // Public functions
      function startSync() {
        if ($this.sync) return $this;
        $this.sync = true;
        var sync = () => {
          const opts = $.extend({}, $this.options.query || {});
          if ($this.localdata.length) {
            let lastmtime = $this.localdata[0].sys.updatedAt;
            opts['sys.updatedAt[gt]'] = lastmtime;
          }
          console.log('Sync:', opts);
          $this.client.getEntries(opts).then(function (response) {
            _processSync(response.items);
            if ($this.sync) {
              $this.syncIntervalHandle = setTimeout(sync, $this.options.syncDelay);
            }
          }, (e) => { // On sync error
            console.log('Contentful connection error.');
            if ($this.sync) {
              console.log('Retrying...');
              $this.syncIntervalHandle = setTimeout(sync, $this.options.syncDelay);
            }
          });
        }
        $this.syncIntervalHandle = setTimeout(sync, $this.options.syncDelay); // Sync start
        return $this;
      }

      function stopSync() {
        if (!$this.sync) return $this;
        clearInterval($this.syncIntervalHandle);
        $this.sync = false;
        return $this;
      }

      function getData() {
        return $this.localdata;
      }

      function setData(entries) {
        if ($this.options.lsid) {
          try {
            window.localStorage.setItem(NAMESPACE + '-' + $this.options.lsid, JSON.stringify(entries));
          } catch(e) {}
        }
        $this.localdata = entries;
        return $this;
      }

      function addData(entries) {
        if (!entries.length) return false;

        // Search and eliminate duplicates from local data
        let localdata = $this.localdata;
        for(let i in entries) {
          let row = entries[i];
          let id = row.sys.id;
          for (let j in localdata) {
            if (localdata[j].sys.id == id) {
              localdata.splice(j, 1);
            }
          }
        }
        let data = entries.concat($this.localdata);
        setData(data);
        return $this;
      }

      function query(query) {
        let q = $.extend(true, $this.options.query, query);
        return $this.client.getEntries(q);
      }

      return {
        getData: getData,
        query: query
      };
    }
});
}(this, this.document, this.jQuery));