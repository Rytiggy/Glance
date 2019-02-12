var _digits = "0123456789";
var _letters = "abcdefghijklmnopqrstuvwxyz";
var _allLetters = _letters + _letters.toUpperCase();

describe('options', function () {
    var chai = require('chai');
    var should = chai.should();

    chai.use(require('chai-string'));
    var simpleRandom = require("../index.js");

    it('should have length of 32', function () {
        var random = simpleRandom({length: 32});
        random.should.have.length(32);
    });

    it('should have only digits', function () {
        var random = simpleRandom({letters: false});
        random.split("").forEach(function (char) {
            _digits.indexOf(char).should.be.above(-1);
        });
    });
    it('should have only letters', function () {
        var random = simpleRandom({digits: false});
        random.split("").forEach(function (char) {
            _allLetters.indexOf(char).should.be.above(-1);
        });
    });
    it('should have only lower case letters', function () {
        var random = simpleRandom({digits: false, caseSensitive: false});
        random.split("").forEach(function (char) {
            _letters.indexOf(char).should.be.above(-1);
        });
    });
    it('should start with _tmp_', function () {
        var random = simpleRandom({prefix: "_tmp_"});
        random.should.startsWith("_tmp");
    });
    it('should end with .docx', function () {
        var random = simpleRandom({suffix: ".docx"});
        random.should.endsWith(".docx");
    });
    it('should contain only "1"', function () {
        var random = simpleRandom({chars: '1'});
        var ones = "1111111111111111";
        random.should.be.equal(ones);
    });
    it('should provide expected outcome with secure random', function () {
        var options = {chars: "1234567890a", length: 40, secure: true};
        var random = simpleRandom(options);
        random.should.have.lengthOf(options.length);
        random.split("").forEach(function (char) {
            options.chars.indexOf(char).should.be.above(-1);
        });
    });
});
