module.exports = sha256
module.exports.sync = sha256sync

const crypto = require('crypto')

async function sha256 (buf, cb) {
  return sha256sync(buf)
}

function sha256sync (buf) {
  return crypto.createHash('sha256')
    .update(buf)
    .digest('hex')
}
