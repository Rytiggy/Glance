var assert = require('assert');
var fs = require('fs');

var elfy = require('../');

describe('Elfy', function() {
  it('should parse executable', function() {
    var bin = fs.readFileSync(__dirname + '/node');
    var elf = elfy.parse(bin);
    assert(elf.class === '64' || elf.class === '32');
    assert(elf.body.sections.some(function(sect) {
      return sect.name === '.SUNW_dof' && sect.type === 'sunw_dof';
    }));
  });
});
