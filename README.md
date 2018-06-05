# radi-fetch

`radi-fetch` is the official HTTP client for [Radi.js](https://radi.js.org). It deeply integrates with Radi for seamless application building.

[![npm version](https://img.shields.io/npm/v/radi-fetch.svg?style=flat-square)](https://www.npmjs.com/package/radi-fetch)
[![npm downloads](https://img.shields.io/npm/dm/radi-fetch.svg?style=flat-square)](https://www.npmjs.com/package/radi-fetch)
[![gzip bundle size](http://img.badgesize.io/https://unpkg.com/radi-fetch@latest/dist/radi-fetch.min.js?compression=gzip&style=flat-square)](https://unpkg.com/radi-fetch@latest/dist/radi-fetch.js)
[![radi workspace on slack](https://img.shields.io/badge/slack-radijs-3eb891.svg?style=flat-square)](https://join.slack.com/t/radijs/shared_invite/enQtMjk3NTE2NjYxMTI2LWFmMTM5NTgwZDI5NmFlYzMzYmMxZjBhMGY0MGM2MzY5NmExY2Y0ODBjNDNmYjYxZWYxMjEyNjJhNjA5OTJjNzQ)


## Installation

To install the stable version:

```
npm install --save radi-fetch
```

This assumes you are using [npm](https://www.npmjs.com/) as your package manager.  

If you're not, you can [access these files on unpkg](https://unpkg.com/radi-fetch/dist/), download them, or point your package manager to them.

#### Browser Compatibility

`radi-fetch` currently is compatible with browsers that support ES5.

## Getting started

Here is how it works. We start by initiating plugin for Radi `Radi.plugin(/* radi-fetch */, /* config */)`. Config here is optional, but we can define crucial parts of http client.

```jsx
import RadiFetch from 'radi-fetch'

Radi.plugin(RadiFetch)
```

or

```jsx
import RadiFetch from 'radi-fetch'

Radi.plugin(RadiFetch, {
  /* We can define base url */
  baseUrl: 'https://example.com',

  /* We can define headers */
  headers: {
    'Authorization': 'key',
  },

  /* We can define dummy data that will be returned for requests made with radi-fetch */
  dummy: true,           // Should return dummy data or use real requests
  dummyTimeout: 1000,    // Dummy data latency simulation
  dummyData: {           // Actual dummy data
    get: {
      '/api': {
        hello: 'world',
      },
    },
  },
});
```

That's it, we're ready to go. We can start fetching our api or whatever we want by using fetch by `$fetch[type](url, params, headers)` handle.
Response can be automatically parsed as JSON by using `.json()` method, or `.text()` for plain text response.

```jsx
class MyComponent extends Radi.Component {
  on() {
    return {
      mount() {
        this.$fetch.get('/test')
          .then(response => {
            console.log(response.json())
          })
          .catch(error => {
            console.log('Got some', error)
          })
      }
    }
  }
}
```

Fetch automatically sets loading state for any ongoing request. We can listen to them in radi using `$loading` handle.

```jsx
/* @jsx Radi.r */

class MyComponent extends Radi.Component {
  view() {
    return (
      <ul>
        <li>/api is { this.$loading.state['/api'] ? 'loading' ? 'ready' }</li>
        <li>Number of active requests: { this.$loading.state.$count }</li>
        <li>Anything loading: { this.$loading.state.$any }</li>
      </ul>
    )
  }
}
```

## Stay In Touch

- [Twitter](https://twitter.com/radi_js)
- [Slack](https://join.slack.com/t/radijs/shared_invite/enQtMjk3NTE2NjYxMTI2LWFmMTM5NTgwZDI5NmFlYzMzYmMxZjBhMGY0MGM2MzY5NmExY2Y0ODBjNDNmYjYxZWYxMjEyNjJhNjA5OTJjNzQ)

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2018-present, Marcis (Marcisbee) Bergmanis
