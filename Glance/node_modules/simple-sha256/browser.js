/* global self */

module.exports = sha256
module.exports.sync = sha256sync

const scope = typeof window !== 'undefined' ? window : self
const crypto = scope.crypto || scope.msCrypto
const subtle = crypto.subtle || crypto.webkitSubtle

function sha256sync (buf) {
  throw new Error('No support for sha256.sync() in the browser, use sha256()')
}

async function sha256 (buf, cb) {
  if (typeof buf === 'string') buf = strToBuf(buf)

  // Browsers throw if they lack support for an algorithm.
  // Promise will be rejected on non-secure origins. (http://goo.gl/lq4gCo)
  const hash = subtle.digest({ name: 'sha-256' }, buf)
  return hex(new Uint8Array(hash))
}

function strToBuf (str) {
  const len = str.length
  const buf = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    buf[i] = str.charCodeAt(i)
  }
  return buf
}

function hex (buf) {
  const len = buf.length
  const chars = []
  for (let i = 0; i < len; i++) {
    const byte = buf[i]
    chars.push((byte >>> 4).toString(16))
    chars.push((byte & 0x0f).toString(16))
  }
  return chars.join('')
}
