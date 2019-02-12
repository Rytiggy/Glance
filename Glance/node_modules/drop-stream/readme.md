# drop-stream [![Build Status](https://travis-ci.org/schnittstabil/drop-stream.svg?branch=master)](https://travis-ci.org/schnittstabil/drop-stream) [![Build status](https://ci.appveyor.com/api/projects/status/0jxydpkl8yflp3t4/branch/master?svg=true)](https://ci.appveyor.com/project/schnittstabil/drop-stream/branch/master) [![Coverage Status](https://coveralls.io/repos/github/schnittstabil/drop-stream/badge.svg?branch=master)](https://coveralls.io/github/schnittstabil/drop-stream?branch=master) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

> A Duplex stream which discards all chunks passed through.

## Install

```
$ npm install drop-stream --save
```

## Usage

```js
const DropStream = require('drop-stream');
const fs = require('fs');

fs.createReadStream('todo.txt')
	.pipe(new DropStream())
	.pipe(fs.createWriteStream('done.txt'))
	.on('finish', () => {
		// => done.txt is empty
	});
```

## API

### Class: DropStream

Drop streams are [Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform) streams.

#### new DropStream([options])

##### options

Type: `Object`

`stream.Transform` [options](http://nodejs.org/api/stream.html#stream_new_stream_transform_options).

#### DropStream#obj([options])

A convenience wrapper for `new DropStream({...options, objectMode: true})`.

## License

MIT © [Michael Mayer](http://schnittstabil.de)
