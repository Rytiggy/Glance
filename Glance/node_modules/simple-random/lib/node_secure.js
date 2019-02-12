var crypto = require('crypto');
module.exports.getRandomBytes = function getRandomBytes(length) {
    return crypto.randomBytes(length);
};
