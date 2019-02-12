function getRandomBytes(length) {
    if (!isSupported) {
        throw new Error("secure random is unsupported in this browser. " +
            "You can change the \"secure\" option to false for pseudo-random values.");
    }
    return window.crypto.getRandomValues(new Uint8Array(length));
}
var isSupported = 'crypto' in window && !!window.crypto && 'getRandomValues' in window.crypto;

module.exports = {
    isSupported: isSupported,
    getRandomBytes: getRandomBytes
};