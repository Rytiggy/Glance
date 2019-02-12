'use strict';

var PlaybackStream = require('../');
var bl = require('bl');
var assert = require('assert');

describe('PlaybackStream', function() {
  it('queues up data for later retrieval', function() {
    var playback = new PlaybackStream();

    playback.write('A');
    playback.write('B');
    playback.write('C');

    var r = playback.newReadableSide();

    assert.strictEqual(r.read().toString(), 'ABC');

    playback.write('DEF');

    assert.strictEqual(r.read().toString(), 'DEF');

    playback.end('GHI');
    assert.strictEqual(r.read().toString(), 'GHI');
    assert.strictEqual(r.read(), null);
  });

  it('works when data is written between creation of the readable side and its inspection', function() {
    var playback = new PlaybackStream({ highWaterMark: 1 });

    playback.write('A');
    playback.write('B');
    playback.write('C');

    var r = playback.newReadableSide({ highWaterMark: 1 });

    playback.write('DEF');

    assert.strictEqual(r.read().toString(), 'AB');
    assert.strictEqual(r.read().toString(), 'C');
    assert.strictEqual(r.read().toString(), 'DEF');
    assert.strictEqual(r.read(), null);
  });

  it('works with multiple readable sides', function(done) {
    var playback = PlaybackStream({ highWaterMark: 1 });

    playback.write('A');
    playback.write('B');
    playback.write('C');

    var r1 = playback.newReadableSide({ highWaterMark: 1 });

    playback.write('DEF');

    var r2 = playback.newReadableSide({ highWaterMark: 1 });

    playback.write('GHI');
    playback.end('JKL');

    var finished = 0;

    r1.pipe(bl(function(err, buf) {
      if (err) throw err;
      assert.strictEqual(buf.toString(), 'ABCDEFGHIJKL');
      if (++finished === 2) done();
    }));

    r2.pipe(bl(function(err, buf) {
      if (err) throw err;
      assert.strictEqual(buf.toString(), 'ABCDEFGHIJKL');
      if (++finished === 2) done();
    }));
  });

  it('can play back after the stream has ended', function() {
    var playback = PlaybackStream({ highWaterMark: 1 });

    playback.write('A');
    playback.write('B');
    playback.write('C');

    var r1 = playback.newReadableSide({ highWaterMark: 1 });

    playback.end('DEF');

    var r2 = playback.newReadableSide({ highWaterMark: 1 });

    var expectedChunks = ['AB', 'C', 'DEF'];
    for (var i = 0; i < expectedChunks.length; ++i) {
      assert.strictEqual(r1.read().toString(), expectedChunks[i]);
      assert.strictEqual(r2.read().toString(), expectedChunks[i]);
    }

    assert.strictEqual(r1.read(), null);
    assert.strictEqual(r2.read(), null);
  });
});
