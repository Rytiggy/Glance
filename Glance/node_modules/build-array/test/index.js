var buildArray = require('../');
var assert = require('assert');

assert.deepEqual(buildArray(2), [undefined, undefined]);
assert.deepEqual(buildArray(2, 1), [0, 0]);