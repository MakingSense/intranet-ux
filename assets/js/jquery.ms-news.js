/**
 * @library MS News
 * @description News for MS Intranet using Contentful
 * @author Marcos Rigoli <rigoli82@gmail.com>
 * @license MIT
 */

;(function(window, document, $, undefined) {
  'use strict';

  var NAMESPACE = 'msnews';
  var VERSION = '0.0.1';

  $.extend($, {
    [NAMESPACE]: function(options) {
      var $this = this;
      $this.options = $.extend(true, {
        contentfulToken: null,  // Contentful Access Token
        contentfulSpace: null,        //Contentful Space
        space: 'default',        // Starting space
        lsid: NAMESPACE,    // Local Storage ID
        sync: false,        // Keep data synced
        syncDelay: 10000,   // Sync delay
        orderby: 'sys.updatedAt', // Field to order by
        order: 'DESC',      // ASC or DESC

        // Default query
        query: {            // Query default options
          include: 10       // Resolve links depth
        },

        // Callbacks
        onInit: null,         // Callback on init (entries from localstorage)
        onFirstRequest: null, // Callback on first request when there is no cache. Params: (entries)
        onSyncNewData: null,  // Callback on sync. Params: (newentries, allentries)
        onNewPage: null       // Callback for processing new data page
      }, options);

      // Private vars
      $this.client = false;
      $this.spaces = [];
      $this.sync = [];
      $this.syncIntervalHandle = [];
      $this.localdata = []
      $this.pageQuerying = [];

      $this.lsid = ($this.options.lsid) ? NAMESPACE + '-' + $this.options.lsid : false;
      _init();

      // Plugin content

      // private functions
      function _init() {
        if ($this.options.lsid && window.localStorage === undefined) {
          $this.options.lsid = false; // No local storage $this time my friend...
          console.log('ms-news: LocalStorage is not supported by the current browser.')
        }
        if (typeof($this.options.onInit) === 'function') {
          $this.options.onInit.call($this, getData());
        }
        if (!$this.options.contentfulToken || !$this.options.contentfulSpace) {
          console.error('ms-news: Missing Contentful connection config.');
          return false;
        }
        let options = {
          accessToken: $this.options.contentfulToken,
          space: $this.options.contentfulSpace
        };
        if ($this.options.host) options.host = $this.options.host;
        $this.client = contentful.createClient(options);
        if (!$this.client) {
          console.log('ms-news: Unable to load client.');
          return false;
        }
        if ($this.options.sync) startSync($this.options.space);
      }

      function _processSync(entries, first) {
        let data = getData();
        if (first && !data.length) {
          setData(entries, true);
          if (typeof($this.options.onFirstRequest) === 'function') {
            $this.options.onFirstRequest.call($this, entries, getData());
          }
        } else {
          if (!entries.length) return;
          prependData(entries);
          if (typeof($this.options.onSyncNewData) === 'function') {
            $this.options.onSyncNewData.call($this, entries, getData());
          }
        }
      }

      // Public functions
      function startSync(space) {
        if ($this.sync.indexOf(space) !== -1) return $this;
        $this.sync.push(space);
        var sync = (space, first) => {
          const opts = $.extend({}, $this.options.query || {});
          let data = getData();
          if (data.length) {
            let value = data[0].sys[$this.options.orderby];
            let operator = $this.options.order === 'DESC' ? 'gt' : 'lt';
            opts[$this.options.orderby + '[' + operator + ']'] = value;
          }
          $this.client.getEntries(opts).then(function (response) {
            _processSync(response.items, space, first);
            if ($this.sync) {
              $this.syncIntervalHandle[space] = setTimeout(sync(space), $this.options.syncDelay);
            }
          }, (e) => { // On sync error
            console.log('Contentful connection error.');
            if ($this.sync) {
              console.log('Retrying...');
              $this.syncIntervalHandle[space] = setTimeout(sync(space), $this.options.syncDelay);
            }
          });
        }
        sync(space, true); // Sync start
        return $this;
      }

      function stopSync() {
        if (!$this.sync) return $this;
        clearInterval($this.syncIntervalHandle[space]);
        $this.sync = false;
        return $this;
      }

      function clearData(ls) {
        $this.localdata = [];
        if (!$this.lsid || !ls) return $this;
        localStorage.removeItem($this.lsid + '-v');
        localStorage.removeItem($this.lsid);
        return $this;
      }

      function getData() {
        if ($this.localdata === false) {
          if ($this.lsid) {
            let version = window.localStorage.getItem($this.lsid + '-v');
            if (version && version === VERSION) {
              try {
                $this.localdata = JSON.parse(window.localStorage.getItem($this.lsid));
                return $this.localdata;
              } catch (e) {
                clearData(true);
              }
            } else {
              clearData(true);
            }
          }
          return $this.localdata = [];
        }
        return $this.localdata;
      }

      function setData(entries, ls) {
        if ($this.options.lsid && ls) {
          try {
            window.localStorage.setItem($this.lsid + '-v', VERSION);
            window.localStorage.setItem($this.lsid, JSON.stringify(entries));
          } catch(e) {}
        }
        $this.localdata = entries;
        return $this;
      }

      function prependData(entries ,ls) {
        if (!entries.length) return false;

        // Search and eliminate duplicates from local data
        let localdata = getData();
        for(let i in entries) {
          let row = entries[i];
          let id = row.sys.id;
          for (let j in localdata) {
            if (localdata[j].sys.id == id) {
              localdata.splice(j, 1);
            }
          }
        }
        let data = entries.concat(localdata);
        setData(data, ls);
        return $this;
      }

      function appendData(entries, ls) {
        if (!entries.length) return false;
        // Search and eliminate duplicates from local data
        let localdata = getData();
        for(let i in entries) {
          let row = entries[i];
          let id = row.sys.id;
          for (let j in localdata) {
            if (localdata[j].sys.id == id) {
              localdata.splice(j, 1);
            }
          }
        }
        let data = localdata.concat(entries);
        setData(data, ls);
        return $this;
      }

      function nextPage() {
        const opts = $.extend({}, $this.options.query || {});
        let data = getData();
        let queryid = -1;
        if (data.length) {
          queryid = data.length - 1;
          let value = data[queryid].sys[$this.options.orderby];
          let operator = $this.options.order === 'DESC' ? 'lt' : 'gt';
          opts[$this.options.orderby + '[' + operator + ']'] = value;
        }
        if ($this.queryingId.indexOf(queryid) !== -1) return false; // already querying...
        $this.queryingId.push(queryid);
        $this.client.getEntries(opts).then(function (response) {
          let entries = response.items
          if (!entries.length) return;
          appendData(entries);
          if (typeof($this.options.onNewPage) === 'function') {
            $this.options.onNewPage.call($this, entries, getData());
          }
        }, (e) => { // On error
          console.log('Contentful connection error.');
          let index = $this.queryingId.indexOf(queryid);
          if (index !== -1) $this.queryingId.splice(index, 1); // removing track of querying element
        });
    }

      function query(query) {
        let q = $.extend(true, $this.options.query, query);
        return $this.client.getEntries(q); // Returning Promise
      }

      return {
        getData: getData,
        query: query,
        startSync: startSync,
        stopSync: stopSync
      };
    }
});
}(this, this.document, this.jQuery));