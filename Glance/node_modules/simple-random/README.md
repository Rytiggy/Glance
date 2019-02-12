# Simple Random
[![Build Status](https://travis-ci.org/dortzur/simple-random.svg?branch=master)](https://travis-ci.org/dortzur/simple-random)  [![npm version](https://badge.fury.io/js/simple-random.svg)](http://badge.fury.io/js/simple-random) [![npm](http://img.shields.io/npm/dm/simple-random.svg)](https://www.npmjs.com/package/simple-random)

A simple flexible javascript library that creates random alpha-numeric strings. Very useful when creating random names for files, folders. Can also create secure random strings for temporary passwords and salts.

Works in both NodeJS and the browser.

###Secure Random 
if the `secure` option is set to `true`, we can create a random byte seed with a cryptography library as opposed to Math.random().
In Node we use the default `crypto` library.
In webpack / browser versions we use the Web Cryptography API if supported.

##Installation
```bash
npm install simple-random --save 
```
##Usage
###Node
```javascript
var sr = require('simple-random');
var randomString = sr(); // Generates a 16 character alpha-numeric string.
// Example output: "pnxTcl2nOBqTNFQR"
```
###WebPack
```javascript
var sr=require('simple-random/browser'); 
var randomString = sr(); // Generates a 16 character alpha-numeric string.
// Example output: "pnxTcl2nOBqTNFQR"
```
###Browser
```html
<script src="simple-random/dist/simple_random.js"></script>
<script>
var randomString = window.simpleRandom();

//Secure Random
var secureRandom;
if (simpleRandom.isSecureSupported){
  secureRandom = simpleRandom({secure:true})
}

</script>
```



##Options
- `length`: The length of the alpha-numeric string (default 16).
- `digits`: should allow digits in random string (default true).
- `letters`: should allow letters in random string (default true).
- `caseSensitive`: if set to false, only lowercase letter characters will be used (default true).
- `secure`: Whether or not to use the `crypto` library for secure random byte seed as opposed to `Math.random()` (default false).
- `prefix`: Prefix.
- `suffix`: Suffix.
- `chars`: A string containing all the characters to draw from, defaults to all alpha-numeric characters (overrides digits, letters and caseSensitive flags).

