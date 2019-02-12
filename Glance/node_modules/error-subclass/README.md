# ErrorSubclass

[![NPM](https://nodei.co/npm/error-subclass.png)](https://www.npmjs.com/package/error-subclass)

[![Build Status](https://travis-ci.org/spudly/error-subclass.svg?branch=master)](https://travis-ci.org/spudly/error-subclass)

[![Dependencies](https://david-dm.org/spudly/error-subclass.svg)](https://david-dm.org/spudly/error-subclass)   [![DevDependencies](https://david-dm.org/spudly/error-subclass/dev-status.svg)](https://david-dm.org/spudly/error-subclass#info=devDependencies)

A JavaScript class that makes Error subclassable. It inherits from Error (in all the right ways), so that you can safely and easily create your own Error subclasses.

The provided class handles all the craziness for preserving stack traces and
other things so that you don't have to worry about it. Create a class that
inherits from it and you're good to go.

* instanceof Error
* instanceof &lt;your subclass&gt;
* stack traces
* .name === &lt;name of subclass&gt;
* .toString()

## Usage

```js
import ErrorSubclass from 'error-subclass';

class MyError extends ErrorSubclass {

  static displayName = 'MyError'; // optional. survives minification

  // Add extra properties/methods if desired:

  get code() {
    return 'MYERROR';
  }

}

// later...
throw new MyError('error message');
```

## License

MIT
