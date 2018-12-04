var version = '0.5.0';

// Pass config to initiate things
var RadiFetch = function (_radi, config) {
  if ( config === void 0 ) config = {};

  var prefix = (config.baseUrl || '').replace(/\/$/, '');

  var HTTP = function HTTP(t, url, params, headers) {
    var this$1 = this;

    this.url = url;
    this.id = url + '';
    this.type = t;
    this.http = new XMLHttpRequest();
    this.headers = Object.assign(config.headers || {}, headers || {});
    this.params = JSON.stringify(params);
    this.reject = function (e) {
      console.error('[Radi Fetch] WARN: Request caught an error.\n', e);
    };

    var n = url.split('?').length - 1;
    if (t === 'get')
      { for (var i in params) {
        url = url.concat(((!n)?'?':'&') + i + '=' + params[i]);
        n += 1;
      } }

    this.http.open(t, prefix + url, true);

    for (var h in this$1.headers) {
      this$1.http.setRequestHeader(h, this$1.headers[h]);
    }

    // Allows to abort request
    this.abort = function () {
      var ref;

      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];
      return (ref = this$1.http).abort.apply(ref, args);
    };
    this.tag = function (key) { return (this$1.id = key, this$1); };
  };

  HTTP.prototype.catch = function (ERR) {
    if (typeof ERR === 'function') {
      this.reject = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        ERR.apply(void 0, args);
      };
    }
    return this
  };

  HTTP.prototype.then = function then(OK, ERR) {
    if (typeof OK === 'function') {
      this.resolve = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        OK.apply(void 0, args);
      };
    }
    if (typeof ERR === 'function') {
      this.reject = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        ERR.apply(void 0, args);
      };
    }
    var self = this;
    this.http.onreadystatechange = function(e) {
      var res = this;
      if (res.readyState === XMLHttpRequest.DONE) {
        var h = {
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

  function applyLoading(subject, value) {
    if (typeof subject === 'object') {
      Object.defineProperty(subject, '$loading', {
        value: value,
        writable: true,
      });
    }
    return subject;
  }

  function Fetch(url, map, options) {
    if ( map === void 0 ) map = function (e) { return e; };
    if ( options === void 0 ) options = {};

    var type = options.type; if ( type === void 0 ) type = 'get';
    var retry = options.retry; if ( retry === void 0 ) retry = 0;
    return function (params) { return function (update) {
      new HTTP(type, url, params, h)
        .then(function (data) {
          update(applyLoading(map(data.json()), false));
        })
        .catch(function (err) {
          if (options.retry > 0) {
            Fetch(url, map, Object.assign({}, options, {retry: retry - 1}))(params)(update);
          }
        });

      return applyLoading({ $loading: true }, true);
    }; };
  }

  Fetch.http = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return new (Function.prototype.bind.apply( HTTP, [ null ].concat( args) ));
  };

  Fetch.http.get = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return new (Function.prototype.bind.apply( HTTP, [ null ].concat( ['get'], args) ));
  };
  Fetch.http.post = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return new (Function.prototype.bind.apply( HTTP, [ null ].concat( ['post'], args) ));
  };
  Fetch.http.put = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return new (Function.prototype.bind.apply( HTTP, [ null ].concat( ['put'], args) ));
  };
  Fetch.http.delete = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return new (Function.prototype.bind.apply( HTTP, [ null ].concat( ['delete'], args) ));
  };
  Fetch.http.options = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return new (Function.prototype.bind.apply( HTTP, [ null ].concat( ['options'], args) ));
  };
  Fetch.http.head = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return new (Function.prototype.bind.apply( HTTP, [ null ].concat( ['head'], args) ));
  };

  Fetch.get = function (u, p, o) { return Fetch(u, p, Object.assign({}, o, {type: 'get'})); };
  Fetch.post = function (u, p, o) { return Fetch(u, p, Object.assign({}, o, {type: 'post'})); };
  Fetch.put = function (u, p, o) { return Fetch(u, p, Object.assign({}, o, {type: 'put'})); };
  Fetch.delete = function (u, p, o) { return Fetch(u, p, Object.assign({}, o, {type: 'delete'})); };
  Fetch.options = function (u, p, o) { return Fetch(u, p, Object.assign({}, o, {type: 'options'})); };
  Fetch.head = function (u, p, o) { return Fetch(u, p, Object.assign({}, o, {type: 'head'})); };

  Fetch.dummy = function (map, timeout) {
      if ( map === void 0 ) map = function (e) { return e; };
      if ( timeout === void 0 ) timeout = 0;

      return function (params) { return function (update) { return (
      setTimeout(update, timeout, applyLoading(map(params), false)), applyLoading({ $loading: true }, true)); }; };
  };

  return Fetch;
};

if (window) { window.RadiFetch = RadiFetch; }

export default RadiFetch;
export { version };
//# sourceMappingURL=radi-fetch.es.js.map
