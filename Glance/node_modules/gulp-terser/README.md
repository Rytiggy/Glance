# gulp-terser

Gulp plugin, compressed es6+ code.

## Install
```
$ npm install gulp-terser --save-dev
```
or
```
$ yarn add gulp-terser --dev
```

## How to use
```javascript
const gulp = require('gulp');
const terser = require('gulp-terser');

function es(){
  return gulp.src('./src/index.js')
    .pipe(terser())
    .pipe(gulp.dest('./build'));
}

gulp.task('default', es);
```

## Options
Terser configuration can be viewed [https://github.com/terser-js/terser#minify-options](https://github.com/terser-js/terser#minify-options).

```javascript
const gulp = require('gulp');
const terser = require('gulp-terser');

function es(){
  return gulp.src('./src/index.js')
    .pipe(terser({
      keep_fnames: true,
      mangle: false
    }))
    .pipe(gulp.dest('./build'));
}

gulp.task('default', es);
```