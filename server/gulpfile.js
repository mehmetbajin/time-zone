'use strict';

const _ = require('lodash');
const gulp = require('gulp');
const exit = require('gulp-exit');
const jshint = require('gulp-jshint');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const nodemon = require('gulp-nodemon');

const paths = {
  js: [
    '*.js',
    'app/**/!(*.spec).js'
  ],
  tests: [
    'app/**/*.spec.js'
  ]
};

const allPaths = _.union(paths.js, paths.tests);

gulp.task('jshint', () => {
  return gulp.src(allPaths)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('eslint', () => {
  return gulp.src(allPaths)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', () => {
  process.env.TESTING = true;
  return gulp.src(paths.js)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src(paths.tests)
        .pipe(mocha({
          reporter: 'spec'
        }))
        .pipe(istanbul.writeReports())
        .pipe(exit());
    });
});

gulp.task('watch', () => {
  gulp.watch(allPaths, ['jshint', 'eslint']);
});

gulp.task('serve', ['default']);

gulp.task('default', ['jshint', 'eslint'], nodemon);
