describe('defaults', function () {
    var should = require('chai').should();
    const defaultChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var simpleRandom = require("../index.js");
    it('should have length of 16', function () {
        var random = simpleRandom();
        random.should.have.length(16);
    });
    it("should only use default chars", function () {
        var random = simpleRandom();
        var randomArray = random.split("");
        randomArray.forEach(function (char) {
            defaultChars.indexOf(char).should.be.above(-1);
        });
    });
});
