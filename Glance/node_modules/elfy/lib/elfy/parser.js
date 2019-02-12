var assert = require('assert');
var util = require('util');
var Reader = require('endian-reader');

var elfy = require('../elfy');
var constants = elfy.constants;

function Parser() {
  Reader.call(this);
}
util.inherits(Parser, Reader);
module.exports = Parser;

Parser.prototype.mapFlags = function mapFlags(value, map) {
  var res = {};

  for (var bit = 1; (value < 0 || bit <= value) && bit !== 0; bit <<= 1)
    if (value & bit)
      res[map[bit] || bit] = true;

  return res;
};

Parser.prototype.execute = function execute(buf) {
  if (buf.length < 16)
    throw new Error('Not enough bytes to parse ident');

  var magic = buf.slice(0, 4).toString();
  if (magic !== '\x7fELF')
    throw new Error('Invalid magic: ' + magic);

  var header = this.parseHeader(buf);
  header.body = this.parseBody(buf, header);
  header.body = this.resolveBody(header.body, header);

  return header;
};

Parser.prototype.parseHeader = function parseHeader(buf) {
  var class_ = constants.class[buf[4]];
  var endian = constants.endian[buf[5]];
  var osabi = constants.osabi[buf[6]];
  var abiversion = constants.abiversion[buf[7]];
  if (class_ !== '32' && class_ !== '64')
    throw new Error('Invalid class: ' + class_);

  if (endian !== 'lsb' && endian !== 'msb')
    throw new Error('Invalid endian: ' + endian);

  this.setEndian(endian);
  if (class_ === '32')
    this.setWord(4);
  else
    this.setWord(8);

  if (class_ === '32') {
    var type = constants.type[this.readUInt16(buf, 16)];
    var machine = constants.machine[this.readUInt16(buf, 18)];
    var version = this.readUInt32(buf, 20);
    var entry = this.readUInt32(buf, 24);
    var phoff = this.readUInt32(buf, 28);
    var shoff = this.readUInt32(buf, 32);
    var flags = this.readUInt32(buf, 36);
    var ehsize = this.readUInt16(buf, 40);
    var phentsize = this.readUInt16(buf, 42);
    var phnum = this.readUInt16(buf, 44);
    var shentsize = this.readUInt16(buf, 46);
    var shnum = this.readUInt16(buf, 48);
    var shstrndx = this.readUInt16(buf, 50);
  } else {
    var type = constants.type[this.readUInt16(buf, 16)];
    var machine = constants.machine[this.readUInt16(buf, 18)];
    var version = this.readUInt32(buf, 20);
    var entry = this.readUInt64(buf, 24);
    var phoff = this.readUInt64(buf, 32);
    var shoff = this.readUInt64(buf, 40);
    var flags = this.readUInt32(buf, 48);
    var ehsize = this.readUInt16(buf, 52);
    var phentsize = this.readUInt16(buf, 54);
    var phnum = this.readUInt16(buf, 56);
    var shentsize = this.readUInt16(buf, 58);
    var shnum = this.readUInt16(buf, 60);
    var shstrndx = this.readUInt16(buf, 62);
  }

  return {
    class: class_,
    endian: endian,
    version: buf[7],
    osabi: osabi,
    abiversion: abiversion,

    type: type,
    machine: machine,
    version: version,
    entry: entry,
    phoff: phoff,
    shoff: shoff,
    flags: flags,
    ehsize: ehsize,
    phentsize: phentsize,
    phnum: phnum,
    shentsize: shentsize,
    shnum: shnum,
    shstrndx: shstrndx
  };
};

Parser.prototype.parseBody = function parseBody(buf, header) {
  return {
    programs: this.parsePrograms(buf, header),
    sections: this.parseSections(buf, header)
  };
};

Parser.prototype.sliceChunks = function sliceChunks(buf, off, count, size) {
  var start = off;
  var end = start + count * size;
  if (end > buf.length)
    throw new Error('Failed to slice chunks');

  var chunks = [];
  for (var off = start; off < end; off += size)
    chunks.push(buf.slice(off, off + size));

  return chunks;
};

Parser.prototype.parsePrograms = function parsePrograms(buf, header) {
  if (header.phoff === 0 || header.phnum === 0)
    return [];

  var programs = this.sliceChunks(buf,
                                  header.phoff,
                                  header.phnum,
                                  header.phentsize);
  return programs.map(function(program) {
    return this.parseProgram(program, header, buf);
  }, this);
};

Parser.prototype.parseProgram = function parseProgram(ent, header, buf) {
  var type = constants.entryType[this.readUInt32(ent, 0)];
  if (header.class === '32') {
    var offset = this.readUInt32(ent, 4);
    var vaddr = this.readUInt32(ent, 8);
    var paddr = this.readUInt32(ent, 12);
    var filesz = this.readUInt32(ent, 16);
    var memsz = this.readUInt32(ent, 20);
    var flags = this.readUInt32(ent, 24);
    var align = this.readUInt32(ent, 28);
  } else {
    var flags = this.readUInt32(ent, 4);
    var offset = this.readUInt64(ent, 8);
    var vaddr = this.readUInt64(ent, 16);
    var paddr = this.readUInt64(ent, 24);
    var filesz = this.readUInt64(ent, 32);
    var memsz = this.readUInt64(ent, 40);
    var align = this.readUInt64(ent, 48);
  }

  return {
    type: type,
    offset: offset,
    vaddr: vaddr,
    paddr: paddr,
    filesz: filesz,
    memsz: memsz,
    flags: this.mapFlags(flags, constants.entryFlags),
    align: align,

    data: buf.slice(offset, offset + filesz)
  };
};

Parser.prototype.parseSections = function parseSections(buf, header) {
  if (header.shoff === 0 || header.shnum === 0)
    return [];

  var sections = this.sliceChunks(buf,
                                  header.shoff,
                                  header.shnum,
                                  header.shentsize);

  return sections.map(function(section) {
    return this.parseSection(section, header, buf);
  }, this);
};

Parser.prototype.parseSection = function parseSection(section, header, buf) {
  var name = this.readUInt32(section, 0);
  var type = this.readUInt32(section, 4);
  if (header.class === '32') {
    var flags = this.readUInt32(section, 8);
    var addr = this.readUInt32(section, 12);
    var off = this.readUInt32(section, 16);
    var size = this.readUInt32(section, 20);
    var link = this.readUInt32(section, 24);
    var info = this.readUInt32(section, 28);
    var addralign = this.readUInt32(section, 32);
    var entsize = this.readUInt32(section, 36);
  } else {
    var flags = this.readUInt64(section, 8);
    var addr = this.readUInt64(section, 16);
    var off = this.readUInt64(section, 24);
    var size = this.readUInt64(section, 32);
    var link = this.readUInt32(section, 40);
    var info = this.readUInt32(section, 44);
    var addralign = this.readUInt64(section, 46);
    var entsize = this.readUInt64(section, 54);
  }

  return {
    name: name,
    type: constants.sectType[type] || type,
    flags: this.mapFlags(flags, constants.sectFlags),
    addr: addr,
    off: off,
    size: size,
    link: link,
    info: info,
    addralign: addralign,
    entsize: entsize,

    data: buf.slice(off, off + size)
  };
};

Parser.prototype.resolveStr = function resolveStr(strtab, off) {
  for (var i = off; i < strtab.length && strtab[i] != 0; i++);

  return strtab.slice(off, i).toString();
};

Parser.prototype.resolveBody = function resolveBody(body, header) {
  var strtab = body.sections[header.shstrndx];
  assert.equal(strtab.type, 'strtab');

  return {
    programs: body.programs,
    sections: body.sections.map(function(section) {
      section.name = this.resolveStr(strtab.data, section.name);
      return section;
    }, this)
  };
};
