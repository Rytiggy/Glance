var secureContainer = require('./lib/node_secure');


var randomFactory = require("./lib/simple_random");
module.exports = randomFactory.create(secureContainer);