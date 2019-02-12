(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.simpleRandom = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
function mathRandom(length, chars) {
    var result = "";
    var index;
    for (var i = length; i > 0; --i) {
        index = Math.round(Math.random() * (chars.length - 1));
        result += chars[index];
    }
    return result;
}

function bytesToChars(byteArray, chars) {
    var index;
    var result = "";
    for (var i = 0; i < byteArray.length; i++) {
        index = byteArray[i] % chars.length;
        result += chars[index];
    }
    return result;
}

var _digits = "0123456789";
var _letters = "abcdefghijklmnopqrstuvwxyz";

function initOptions(options) {

    //defaults
    options = options || {};
    options.length = options.length || 16;
    options.chars = options.chars || "";
    options.prefix = options.prefix || "";
    options.suffix = options.suffix || "";
    options.digits = typeof options.digits === "undefined" ? true : options.digits;
    options.letters = typeof options.letters === "undefined" ? true : options.letters;
    options.caseSensitive = typeof options.caseSensitive === "undefined" ? true : options.caseSensitive;

    if (!options.chars) {
        if (options.digits) {
            options.chars += _digits;
        }
        if (options.letters) {
            options.chars += _letters;

            if (options.caseSensitive) {
                options.chars += _letters.toUpperCase();
            }
        }

    }

    if (typeof options.secure === "undefined") {
        options.secure = false;
    }
    return options;
}

function createSimpleRandom(secureContainer) {
    return function simpleRandom(options) {
        options = initOptions(options);
        var result;
        if (options.secure) {
            var randomBytes = secureContainer.getRandomBytes(options.length);
            result = bytesToChars(randomBytes, options.chars);
        } else {
            result = mathRandom(options.length, options.chars);
        }
        return options.prefix + result + options.suffix;
    };

}

module.exports = {create: createSimpleRandom};





},{}],3:[function(require,module,exports){
var secureContainer = require('./lib/browser_secure');

var randomFactory = require("./lib/simple_random");
module.exports = randomFactory.create(secureContainer);
module.exports.isSecureSupported = secureContainer.isSupported;
},{"./lib/browser_secure":1,"./lib/simple_random":2}]},{},[3])(3)
});