var elfy = exports;

elfy.constants = require('./elfy/constants');
elfy.Parser = require('./elfy/parser');

elfy.parse = function parse(buf) {
  return new elfy.Parser().execute(buf);
};
