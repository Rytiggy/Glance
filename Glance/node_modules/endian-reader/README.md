# Endian reader

Simple helper for reading from buffer with specified (ahead of time) endian.

## Usage

```javascript
var Reader = require('endian-reader');

var buf = new Buffer('0102030405060708', 'hex');
var r = new Reader('le', 4);  // le, little or lsb, otherwise big endian will be
                              // used.
                              // Second argument is a word size

assert.equal(r.readInt8(buf, 0), 0x1);
assert.equal(r.readInt16(buf, 0), 0x0201);
assert.equal(r.readInt32(buf, 0), 0x04030201);
assert.equal(r.readInt64(buf, 0), 0x0807060504030201);
assert.equal(r.readWord(buf, 0), 0x04030201);
```

#### LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2014.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.
