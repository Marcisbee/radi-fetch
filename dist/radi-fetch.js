(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['radi-fetch'] = {})));
}(this, (function (exports) { 'use strict';

const version = '0.3.22';

// Pass config to initiate things
var index = ({
    r,
    l,
    mount,
    headless,
    Component,
  }, config = {}) => {
  let prefix = (config.baseUrl || '').replace(/\/$/, '');
  let dummy = config.dummy && (config.dummyData || {});

  let fetchdummy = (type, key, cb) => {
    setTimeout(() => {
      cb(dummy[type] && dummy[type][key] || null);
    }, config.dummyTimeout || 100);
  };

  let HTTP = function HTTP(t, url, params, headers, loading) {
    this.url = url;
    this.id = url + '';
    this.type = t;
    this.start = () => loading.start(this.id);
    this.end = () => loading.end(this.id);
    this.http = new XMLHttpRequest();
    this.headers = Object.assign(config.headers || {}, headers || {});
    this.params = JSON.stringify(params);
    this.resolve = () => {
      this.end();
    };
    this.reject = e => {
      console.error('[Radi Fetch] WARN: Request caught an error.\n', e);
      this.end();
    };

    let n = url.split('?').length - 1;
    if (t === 'get')
      for (let i in params) {
        url = url.concat(((!n)?'?':'&') + i + '=' + params[i]);
        n += 1;
      }

    this.http.open(t, prefix + url, true);

    for (let h in this.headers) {
      this.http.setRequestHeader(h, this.headers[h]);
    }

    // Allows to abort request
    this.abort = (...args) => this.http.abort(...args);
    this.tag = key => (this.id = key, this);
  };

  HTTP.prototype.catch = function (ERR) {
    if (typeof ERR === 'function') {
      this.reject = (...args) => {
        ERR(...args);
        this.end();
      };
    }
    return this
  };

  HTTP.prototype.then = function then(OK, ERR) {
    this.start();
    if (typeof OK === 'function') {
      this.resolve = (...args) => {
        OK(...args);
        this.end();
      };
    }
    if (typeof ERR === 'function') {
      this.reject = (...args) => {
        ERR(...args);
        this.end();
      };
    }
    if (dummy) {
      fetchdummy(this.type, this.url, data => {
        this.resolve({
          headers: '',
          status: 'dummy',
          response: JSON.stringify(data),
          text: () => JSON.stringify(data),
          json: () => data,
        });
      });
      return this;
    }
    let self = this;
    this.http.onreadystatechange = function(e) {
      let res = this;
      if (res.readyState === XMLHttpRequest.DONE) {
        let h = {
          headers: self.http.getAllResponseHeaders(),
          status: res.status,
          response: res.response
        };
        if (res.status === 200) {
          h.text = function() { return res.responseText };
          h.json = function() {
            try {
              return JSON.parse(this.text());
            }
            catch(error) {
              console.error('[Radi Fetch] WARN: Response is not JSON, using fallback to empty JSON.\n', error);
              return {};
            }
          };
          self.resolve(h);
        } else {
          self.reject(h);
        }
      }
    };
    this.http.send(this.params);
    return this
  };

  class Fetch extends Component {
    get(u, p, h) { return new HTTP('get', u, p, h, this.$loading) }
    post(u, p, h) { return new HTTP('post', u, p, h, this.$loading) }
    put(u, p, h) { return new HTTP('put', u, p, h, this.$loading) }
    delete(u, p, h) { return new HTTP('delete', u, p, h, this.$loading) }
    options(u, p, h) { return new HTTP('options', u, p, h, this.$loading) }
    head(u, p, h) { return new HTTP('head', u, p, h, this.$loading) }
  }

  class Loading extends Component {
    state() {
      return {
        $any: false,
        $count: 0,
      }
    }

    start(key) {
      if (this.state[key]) return false
      this.setState({
        [key]: true,
        $count: this.state.$count + 1,
        $any: !!(this.state.$count + 1),
      });
    }

    end(key) {
      this.setState({
        [key]: false,
        $count: this.state.$count - 1,
        $any: !!(this.state.$count - 1),
      });
    }

    run(key, fn) {
      if (this.state[key]) return false
      this.start(key);

      fn(cb => {
        if (typeof cb === 'function') cb();
        this.end(key);
      });
    }
  }

  // Initiates loading component
  headless('loading', Loading);

  // Initiates fetch component
  headless('fetch', Fetch);

  return {
    config,
    Fetch,
  };
};

exports.version = version;
exports.default = index;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=radi-fetch.js.map
