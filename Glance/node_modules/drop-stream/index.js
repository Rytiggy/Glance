'use strict';
const Transform = require('readable-stream/transform');

class DropStream extends Transform {
	_transform(chunk, encoding, cb) {
		cb();
	}
}

module.exports = DropStream;

module.exports.obj = options => {
	options = options || {};
	options.objectMode = true;
	return new DropStream(options);
};
