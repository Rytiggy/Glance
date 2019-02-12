var secureContainer = require('./lib/browser_secure');

var randomFactory = require("./lib/simple_random");
module.exports = randomFactory.create(secureContainer);
module.exports.isSecureSupported = secureContainer.isSupported;