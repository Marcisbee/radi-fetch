export const version = '0.5.0';

// Pass config to initiate things
const RadiFetch = (_radi, config = {}) => {
  let prefix = (config.baseUrl || '').replace(/\/$/, '');

  let HTTP = function HTTP(t, url, params, headers) {
    this.url = url
    this.id = url + ''
    this.type = t
    this.http = new XMLHttpRequest()
    this.headers = Object.assign(config.headers || {}, headers || {})
    this.params = JSON.stringify(params)
    this.reject = e => {
      console.error('[Radi Fetch] WARN: Request caught an error.\n', e);
    };

    let n = url.split('?').length - 1
    if (t === 'get')
      for (let i in params) {
        url = url.concat(((!n)?'?':'&') + i + '=' + params[i])
        n += 1
      }

    this.http.open(t, prefix + url, true)

    for (let h in this.headers) {
      this.http.setRequestHeader(h, this.headers[h])
    }

    // Allows to abort request
    this.abort = (...args) => this.http.abort(...args)
    this.tag = key => (this.id = key, this)
  }

  HTTP.prototype.catch = function (ERR) {
    if (typeof ERR === 'function') {
      this.reject = (...args) => {
        ERR(...args)
      };
    }
    return this
  }

  HTTP.prototype.then = function then(OK, ERR) {
    if (typeof OK === 'function') {
      this.resolve = (...args) => {
        OK(...args)
      };
    }
    if (typeof ERR === 'function') {
      this.reject = (...args) => {
        ERR(...args)
      };
    }
    let self = this
    this.http.onreadystatechange = function(e) {
      let res = this
      if (res.readyState === XMLHttpRequest.DONE) {
        let h = {
          headers: self.http.getAllResponseHeaders(),
          status: res.status,
          response: res.response
        }
        if (res.status === 200) {
          h.text = function() { return res.responseText }
          h.json = function() {
            try {
              return JSON.parse(this.text());
            }
            catch(error) {
              console.error('[Radi Fetch] WARN: Response is not JSON, using fallback to empty JSON.\n', error);
              return {};
            }
          }
          self.resolve(h)
        } else {
          self.reject(h)
        }
      }
    }
    this.http.send(this.params)
    return this
  }

  function applyLoading(subject, value) {
    if (typeof subject === 'object') {
      Object.defineProperty(subject, '$loading', {
        value,
        writable: true,
      });
    }
    return subject;
  }

  function Fetch(url, map = e => e, options = {}) {
    const {
      type = 'get',
      retry = 0,
    } = options;
    return (params) => (update) => {
      new HTTP(type, url, params, h)
        .then(data => {
          update(applyLoading(map(data.json()), false));
        })
        .catch(err => {
          if (options.retry > 0) {
            Fetch(url, map, { ...options, retry: retry - 1 })(params)(update);
          }
        })

      return applyLoading({ $loading: true }, true);
    };
  }

  Fetch.http = (...args) => new HTTP(...args);

  Fetch.http.get = (...args) => new HTTP('get', ...args);
  Fetch.http.post = (...args) => new HTTP('post', ...args);
  Fetch.http.put = (...args) => new HTTP('put', ...args);
  Fetch.http.delete = (...args) => new HTTP('delete', ...args);
  Fetch.http.options = (...args) => new HTTP('options', ...args);
  Fetch.http.head = (...args) => new HTTP('head', ...args);

  Fetch.get = (u, p, o) => Fetch(u, p, { ...o, type: 'get' });
  Fetch.post = (u, p, o) => Fetch(u, p, { ...o, type: 'post' });
  Fetch.put = (u, p, o) => Fetch(u, p, { ...o, type: 'put' });
  Fetch.delete = (u, p, o) => Fetch(u, p, { ...o, type: 'delete' });
  Fetch.options = (u, p, o) => Fetch(u, p, { ...o, type: 'options' });
  Fetch.head = (u, p, o) => Fetch(u, p, { ...o, type: 'head' });

  Fetch.dummy = (map = e => e, timeout = 0) =>
    (params) => (update) => (
      setTimeout(update, timeout, applyLoading(map(params), false)),
      applyLoading({ $loading: true }, true)
    );

  return Fetch;
};

if (window) window.RadiFetch = RadiFetch;
export default RadiFetch;
