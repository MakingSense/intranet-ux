/**
 * @library MS News
 * @description News for MS Intranet using Contentful
 * @author Marcos Rigoli <rigoli82@gmail.com>
 * @license MIT
 */

;(function(window, document, $, undefined) {
  'use strict';

  const NAMESPACE = 'msNews';
  const VERSION = '0.0.1';

  $.extend($, {
    msNews: function(options) {
      const self = {};
      const defaults = {
        contentfulToken: null,      // Contentful Access Token
        contentfulSpace: null,      // Contentful Space
        space: 'default',           // Default data space (for caching)
        modField: 'sys.updatedAt',
        lsid: NAMESPACE,            // Local Storage ID
        sync: false,                // Keep data synced
        syncDelay: 10000,           // Sync delay

        // Default query
        query: {                    // Query default options
          limit: 100,
          include: 10               // Resolve links depth (max: 10)
        },

        // Callbacks
        onInit: null,               // Callback on init (entries from localstorage)
        onQuery: null,              // Called at the beginning of a query
        afterQuery: null            // Called at the end of a query
      }
      self.options = $.extend(true, {}, defaults, options);

      // Private vars
      self.client = false;
      self.spaces = [];
      self.defaultSpace = {};
      self.localdata = []
      self.pageQuerying = [];

      self.lsid = (self.options.lsid) ? NAMESPACE + '-' + self.options.lsid : false;
      _init();

      // Plugin content

      // private functions
      function _init() {
        if (self.options.lsid && window.localStorage === undefined) {
          self.options.lsid = false; // No local storage self time my friend...
          console.log(NAMESPACE + ': LocalStorage is not supported by the current browser.')
        }
        let s = self.defaultSpace = _getSpace(self.options.space);
        if (typeof(self.options.onInit) === 'function') {
          self.options.onInit(getData());
        }
        if (!self.options.contentfulToken || !self.options.contentfulSpace) {
          console.error(NAMESPACE + ': Missing Contentful connection config.');
          return false;
        }
        let options = {
          accessToken: self.options.contentfulToken,
          space: self.options.contentfulSpace
        };
        if (self.options.host) options.host = self.options.host;
        self.client = contentful.createClient(options);
        if (!self.client) {
          console.error(NAMESPACE + ': Unable to load client.');
          return false;
        }
      }

      function _getSpace(space) {
        space = (space) ? space : self.options.space;
        if (self.spaces[space] === undefined) {
          self.spaces[space] = {
            name: space,
            localdata: false
          };
        }
        let s = self.spaces[space];
        if (s.name !== space) s.name = space;
        return s;
      }

      function _setSpace(space, obj) {
        if (!space) return false;
        if (obj.name !== space) obj.name = space;
        self.spaces[space] = obj;
      }

      // Public functions
      function query(space, query, callback) {
        let s = _getSpace(space);
        let data = getData(s.name);
        s.query = $.extend(true, {}, self.options.query || {}, query || {});
        let q = $.extend({}, s.query);
        q.order = (q.order === 'DESC') ? '-' + s.query.orderby : s.query.orderby;
        delete q.orderby;
        get(q).then(function (response) {
          let entries = response.items;
          if (entries.length < s.query.limit) s.lastPage = true;
          setData(entries, s.name);
          if (typeof(callback) === 'function') {
            callback.call(self, entries);
          }
        }, (e) => { // On sync error
          console.log(NAMESPACE + ': Query error.', e, q);
        });
      }

      function setQuery(space, query) {
        let s = _getSpace(space);
        let data = getData(s.name);
        s.query = $.extend(true, {}, self.options.query || {}, query || {});
        s.lastPage = false;
      }

      function sync(space, callback) {
        let s = _getSpace(space);
        if (s.sync) return self;
        s.sync = true;
        var sync = (s, first) => {
          let q = $.extend(true, {}, s.query); // Copy object
          q.order = 'DESC' ? '-' + s.query.orderby : s.query.orderby;
          let latest = getLatestEntry(s.name);
          if (latest !== false) {
            let value = omap(latest, self.options.modField);
            let filter = self.options.modField + '[gt]';
            q[filter] = value;
          }
          delete q.orderby;
          self.client.getEntries(q).then(function (response) {
            let entries = response.items;
            if (first || entries.length) {
              let result = updateData(entries, s.name);
              if (typeof(callback) === 'function') {
                callback.call(self, result, getData(s.name), first);
              }
            }
            s.syncIntervalHandle = setTimeout(() => { sync(s, false) }, self.options.syncDelay);
          }, (e) => { // On sync error
            s.syncIntervalHandle = setTimeout(() => { sync(s, false) }, self.options.syncDelay);
          });
        }
        sync(s, true); // Sync start
        return self;
      }

      function getLatestEntry(space) {
        let s = _getSpace(space);
        let opath = self.options.modField;
        let data = getData(s.name);
        let latest = false;
        for (let i in data) {
          if (latest === false || omap(data[i], opath) > omap(latest, opath)) {
            latest = data[i];
          }
        }
        return latest;
      }

      function get(q) {
        if (typeof(self.options.onQuery) === 'function') {
          self.options.onQuery.call(self, true);
        }
        return self.client.getEntries(q).then(function (result) {
          if (typeof(self.options.afterQuery) === 'function') {
            self.options.afterQuery.call(self, result, q);
          }
          return result;
        }, function (e) {
          if (typeof(self.options.afterQuery) === 'function') {
            self.options.afterQuery.call(self, false, q, e);
          }
          return e;
        });
      }

      // Function which allows to navigate an object properties by a string
      function omap(obj, map) {
        let walker = obj;
        var arr = map.split(".");
        while(arr.length && walker) {
          walker = walker[arr.shift()];
          if (typeof(walker) === 'undefined') return null;
        }
        return walker;
      }

      function stopSync(space) {
        let s = _getSpace(space);
        if (!s.sync) return false;
        clearInterval(s.syncIntervalHandle);
        s.syncIntervalHandle = null;
        return self;
      }

      function clearData(space) {
        let s = _getSpace(space);
        s.localdata = [];
        if (!self.lsid) return self;
        let ls = self.lsid + '-' + space;
        localStorage.removeItem(ls + '-v');
        localStorage.removeItem(ls);
        return self;
      }

      function getData(space) {
        let s = _getSpace(space);
        if (s.localdata === false) {
          if (self.lsid) {
            let ls = self.lsid + '-' + s.name;
            let version = window.localStorage.getItem(ls + '-v');
            if (version === VERSION) {
              try {
                s.localdata = JSON.parse(window.localStorage.getItem(ls));
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
        let s = _getSpace(space);
        if (self.options.lsid) {
          let ls = self.lsid + '-' + s.name;
          try {
            window.localStorage.setItem(ls + '-v', VERSION);
            window.localStorage.setItem(ls, JSON.stringify(entries));
          } catch(e) {}
        }
        s.localdata = entries;
        return self;
      }

      function updateData(entries, space) {
        // update data mantaining order
        let s = _getSpace(space);
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
        let output = {
          updated: false,
          new: false
        }
        return output;
      }

      function prependData(entries, space) {
        let s = _getSpace(space);
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
        return self;
      }

      function appendData(entries, space) {
        let s = _getSpace(space);
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
        let data = localdata.concat(entries);
        setData(data, s.name);
        return self;
      }

      function nextPage(space, callback) {
        let s = _getSpace(space);
        if (!s.query) {
          console.error(NAMESPACE + ": Can't get next page from space without previous query or sync.");
          return false;
        }

        if (s.pQuery) return false; // Already querying...

        if (s.lastPage) {
          if (typeof(callback) === 'function') {
            callback(self, [], getData(s.name));
          }
          return false;
        }

        s.pQuery = true;
        let data = getData(s.name);
        let q = $.extend({}, s.query); // Copy object

        if (!q.order || !q.orderby) {
          console.error(NAMESPACE + ': nextPage() must have an order and orderby clause.');
          return self;
        }

        q.order = 'DESC' ? '-' + s.query.orderby : s.query.orderby;
        if (data.length) {
          let temp = s.query.orderby.split('.');
          let value = data[data.length - 1][temp[0]][temp[1]];
          let operator = s.query.order === 'DESC' ? 'lt' : 'gt';
          let filter = s.query.orderby + '[' + operator + ']';
          q[filter] = value;
        }
        delete q.orderby;
        get(q).then(function (response) {
          s.pQuery = false;
          let entries = response.items;
          if (!entries.length) {
            s.lastPage = true;
          } else {
            appendData(entries, s.name);
          }
          if (typeof(callback) === 'function') {
            callback(self, entries, getData(s.name));
          }
        }, (e) => { // On error
          s.pQuery = false;
          console.log(NAMESPACE + ': Contentful nextPage() error.', e, q);
        });
      }

      return {
        setQuery: setQuery,
        nextPage: nextPage,
        getData: getData,
        query: query,
        sync: sync,
        stopSync: stopSync
      };
    }
});
}(this, this.document, this.jQuery));