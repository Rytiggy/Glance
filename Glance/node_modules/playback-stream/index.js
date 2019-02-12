'use strict';

var stream = require('readable-stream');
var util = require('util');

function PlaybackSink(opts) {
  if (!(this instanceof PlaybackSink)) {
    return new PlaybackSink(opts);
  }

  stream.Transform.call(this, opts);

  this._chunks = [];
}

util.inherits(PlaybackSink, stream.Transform);

PlaybackSink.prototype._transform = function(chunk, encoding, callback) {
  this._chunks.push(chunk);

  callback(null, chunk);
};

PlaybackSink.prototype._flush = function(callback) {
  this._chunks.push(null);

  callback(null);
};

PlaybackSink.prototype.newReadableSide = function(opts) {
  var source = new stream.PassThrough(opts);
  var ended = false;

  // Make sure the readable buffer is empty before attaching the pipe.
  while (this.read() !== null);

  for (var i = 0; i < this._chunks.length; ++i) {
    if (this._chunks[i] !== null) {
      source.write(this._chunks[i]);
    } else {
      source.end();
      ended = true;
      break;
    }
  }

  if (!ended) {
    this.pipe(source);
  }

  return source;
};

module.exports = PlaybackSink;
