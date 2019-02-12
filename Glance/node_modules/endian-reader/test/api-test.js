var assert = require('assert');
var Reader = require('../');

describe('Endian reader', function() {
  it('should read bytes in LE', function() {
    var buf = new Buffer('0102030405060708', 'hex');
    var r = new Reader('le');

    assert.equal(r.readInt8(buf, 0), 0x1);
    assert.equal(r.readInt16(buf, 0), 0x0201);
    assert.equal(r.readInt32(buf, 0), 0x04030201);
    assert.equal(r.readInt64(buf, 0), 0x0807060504030201);
    assert.equal(r.readWord(buf, 0), 0x04030201);
  });

  it('should read bytes in BE', function() {
    var buf = new Buffer('0102030405060708', 'hex');
    var r = new Reader('be');

    assert.equal(r.readInt8(buf, 0), 0x1);
    assert.equal(r.readInt16(buf, 0), 0x0102);
    assert.equal(r.readInt32(buf, 0), 0x01020304);
    assert.equal(r.readInt64(buf, 0), 0x0102030405060708);
    assert.equal(r.readWord(buf, 0), 0x01020304);
  });
});
