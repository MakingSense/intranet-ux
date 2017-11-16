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
        contentfulToken: null,      // Contentful Access Token
        contentfulSpace: null,      // Contentful Space
        space: 'default',           // Default data space (for caching)
        lsid: NAMESPACE,            // Local Storage ID
        sync: false,                // Keep data synced
        syncDelay: 10000,           // Sync delay
        orderby: 'sys.updatedAt',   // Field to order by
        order: 'DESC',              // ASC or DESC

        // Default query
        query: {                    // Query default options
          include: 10               // Resolve links depth (max: 10)
        },

        // Callbacks
        onInit: null,               // Callback on init (entries from localstorage)
      }, options);

      // Private vars
      $this.client = false;
      $this.spaces = [];
      $this.defaultSpace = {};
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
          console.log(NAMESPACE + ': LocalStorage is not supported by the current browser.')
        }
        let s = $this.defaultSpace = getSpace($this.options.space);
        if (typeof($this.options.onInit) === 'function') {
          $this.options.onInit.call($this, getData());
        }
        if (!$this.options.contentfulToken || !$this.options.contentfulSpace) {
          console.error(NAMESPACE + ': Missing Contentful connection config.');
          return false;
        }
        let options = {
          accessToken: $this.options.contentfulToken,
          space: $this.options.contentfulSpace
        };
        if ($this.options.host) options.host = $this.options.host;
        $this.client = contentful.createClient(options);
        if (!$this.client) {
          console.error(NAMESPACE + ': Unable to load client.');
          return false;
        }
      }

      function _getSpace(space) {
        space = (space) ? space : $this.options.space;
        if ($this.spaces[space] === undefined) {
          $this.spaces[space] = {
            name: space,
            localdata: false
          };
        }
        let s = $this.spaces[space];
        if (s.name !== space) s.name = space;
        return s;
      }

      function _setSpace(space, obj) {
        if (!space) return false;
        if (obj.name !== space) obj.name = space;
        $this.spaces[space] = obj;
      }

      // Public functions
      function query(space, query, callback) {
        let s = getSpace(space);
        let data = getData(s.name);
        s.query = $.extend({}, $this.options.query || {}, query || {});
        $this.client.getEntries(q).then(function (response) {
          let entries = response.items;
          if (entries) {
            setData(s.name, entries);
            if (typeof(callback) === 'function') {
              callback.call($this, getData(s.name));
            }
          }
        }, (e) => { // On sync error
          console.log(NAMESPACE + ': Query error.', e, q);
        });
      }

      function setQuery(space, query) {
        let s = getSpace(space);
        let data = getData(s.name);
        s.query = $.extend({}, $this.options.query || {}, query || {});
      }

      function sync(space, query, callback) {
        let s = getSpace(space);
        if (s.sync) return $this;
        let data = getData(s.name);
        s.query = $.extend({}, $this.options.query || {}, s.query || {}, query || {});
        s.sync = true;
        var sync = (s, first) => {
          let data = getData(s.name);
          let q = $.extend({}, s.query); // Copy object
          if (data.length) {
            let value = data[0].sys[s.query.orderby];
            let operator = s.query.order === 'DESC' ? 'gt' : 'lt';
            q[s.query.orderby + '[' + operator + ']'] = value;
          }
          $this.client.getEntries(q).then(function (response) {
            let entries = response.items;
            if (entries) {
              prependData(s.name, entries);
              if (typeof(callback) === 'function') {
                callback.call($this, entries, getData(s.name), first);
              }
            }
            s.syncIntervalHandle = setTimeout(sync(s), $this.options.syncDelay);
          }, (e) => { // On sync error
            console.log(NAMESPACE + ': Contentful sync error.', e, q, 'Retrying sync...');
            s.syncIntervalHandle = setTimeout(sync(s), $this.options.syncDelay);
          });
        }
        sync(s, true); // Sync start
        return $this;
      }

      function stopSync(space) {
        let s = getSpace(space);
        if (!s.sync) return false;
        clearInterval(s.syncIntervalHandle);
        s.syncIntervalHandle = null;
        return $this;
      }

      function clearData(space) {
        let s = getSpace(space);
        s.localdata = [];
        if (!$this.lsid) return $this;
        let ls = $this.lsid + '-' + space;
        localStorage.removeItem(ls + '-v');
        localStorage.removeItem(ls);
        return $this;
      }

      function getData(space) {
        let s = getSpace(space);
        if (s.localdata === false) {
          if ($this.lsid) {
            let ls = $this.lsid + '-' + s.name;
            let version = window.localStorage.getItem(ls + '-v');
            if (version === VERSION) {
              try {
                s.localdata = JSON.parse(window.localStorage.getItem(ls));
                s.hasData = true;
                return s.localdata;
              } catch (e) {
                clearData(s.name);
              }
            } else {
              clearData(s.name);
            }
          }
          return s.localdata = [];
        }
        return s.localdata;
      }

      function setData(entries, space) {
        let s = getSpace(space);
        if ($this.options.lsid) {
          let ls = $this.lsid + '-' + s.name;
          try {
            window.localStorage.setItem(ls + '-v', VERSION);
            window.localStorage.setItem(ls, JSON.stringify(entries));
          } catch(e) {}
        }
        s.hasData = true;
        s.localdata = entries;
        return $this;
      }

      function prependData(entries, space) {
        let s = getSpace(space);
        if (!entries.length) return false;

        // Search and eliminate duplicates from local data
        let localdata = getData(space);
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
        setData(data, s.name);
        return $this;
      }

      function appendData(entries, space) {
        let s = getSpace(space);
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
        setData(data, s.name);
        return $this;
      }

      function nextPage(space, callback) {
        let s = getSpace(space);
        if (!s.query) {
          console.error(NAMESPACE + ": Can't get next page from space without previous query or sync.");
          return false;
        }
        if (s.pQuery) return false; // Already querying...
        s.pQuery = true;
        let data = getData(s.name);
        let q = $.extend({}, s.query); // Copy object
        if (data.length) {
          let value = data[data.length - 1].sys[$this.options.orderby];
          let operator = $this.options.order === 'DESC' ? 'lt' : 'gt';
          q[$this.options.orderby + '[' + operator + ']'] = value;
        }
        $this.client.getEntries(q).then(function (response) {
          s.pQuery = false;
          let entries = response.items
          if (!entries.length) return;
          appendData(s.name, entries);
          if (typeof(callback) === 'function') {
            callback.call($this, entries, getData(s.name));
          }
        }, (e) => { // On error
          s.pQuery = false;
          console.log(NAMESPACE + ': Contentful nextPage() error.', e, q);
        });
      }

      return {
        getData: getData,
        query: query,
        sync: sync,
        stopSync: stopSync
      };
    }
});
}(this, this.document, this.jQuery));