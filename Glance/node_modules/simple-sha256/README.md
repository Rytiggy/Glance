# simple-sha256 [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/simple-sha256/master.svg
[travis-url]: https://travis-ci.org/feross/simple-sha256
[npm-image]: https://img.shields.io/npm/v/simple-sha256.svg
[npm-url]: https://npmjs.org/package/simple-sha256
[downloads-image]: https://img.shields.io/npm/dm/simple-sha256.svg
[downloads-url]: https://npmjs.org/package/simple-sha256
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

### Generate SHA-256 hashes (in Node and the Browser)

In Node.js, this package uses [`crypto.createHash()`](https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options). In the browser, it uses [crypto.subtle.digest()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest).

### install

```
npm install simple-sha256
```

### usage

Async (returns a `Promise`):

```js
const sha256 = require('simple-sha256')

init()

async function init () {
  const hash = await sha256('hey there')
  console.log(hash)
  // 74ef874a9fa69a86e091ea6dc2668047d7e102d518bebed19f8a3958f664e3da
}
```

Sync:

```js
const sha256 = require('simple-sha256')
console.log(sha256.sync('hey there'))
// 74ef874a9fa69a86e091ea6dc2668047d7e102d518bebed19f8a3958f664e3da
```

### see also

- [simple-sha1](https://www.npmjs.com/package/simple-sha1)

### license

MIT. Copyright (c) [Feross Aboukhadijeh](https://feross.org).

