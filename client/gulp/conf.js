const util = require('gulp-util');

module.exports.paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
  e2e: 'e2e',
  gulp: 'gulp'
};

module.exports.wiredep = {
  directory: 'bower_components'
};

module.exports.errorHandler = function (title) {
  'use strict';

  return function (err) {
    util.log(util.colors.red(`[${title}]`), err.toString());
    this.emit('end');
  };
};
