playback-stream
===============

[![NPM Version](https://img.shields.io/npm/v/playback-stream.svg?style=flat)](https://npmjs.org/package/playback-stream)
[![NPM Downloads](https://img.shields.io/npm/dm/playback-stream.svg?style=flat)](https://npmjs.org/package/playback-stream)
[![Build Status](https://travis-ci.org/addaleax/playback-stream.svg?style=flat&branch=master)](https://travis-ci.org/addaleax/playback-stream?branch=master)
[![Coverage Status](https://coveralls.io/repos/addaleax/playback-stream/badge.svg?branch=master)](https://coveralls.io/r/addaleax/playback-stream?branch=master)
[![Dependency Status](https://david-dm.org/addaleax/playback-stream.svg?style=flat)](https://david-dm.org/addaleax/playback-stream)

A stream whose contents can be played back many times by storing its contents in memory.

Install:
`npm install playback-stream`

```js
const PlaybackStream = require('playback-stream');

const playback = new PlaybackStream();

request('https://placekitten.com/600/400').pipe(playback);
http.createServer((req, resp) => {
  resp.writeHead(200, { 'Content-Type': 'image/jpeg' });
  playback.newReadableSide().pipe(resp);
}).listen(8080);
```

License
=======

MIT
