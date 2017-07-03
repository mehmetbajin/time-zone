'use strict';

const gulp = require('gulp');
const conf = require('./conf');

const $ = require('gulp-load-plugins')();

const options = {
  indent_size: 2,
  indent_char: ' ',
  eol: '\n',
  indent_level: 0,
  indent_with_tabs: false,
  preserve_newlines: true,
  max_preserve_newlines: 2,
  jslint_happy: true,
  space_after_anon_function: true,
  brace_style: 'collapse',
  keep_array_indentation: false,
  keep_function_indentation: false,
  space_before_conditional: true,
  break_chained_methods: false,
  eval_code: false,
  unescape_strings: false,
  wrap_line_length: 0,
  wrap_attributes: 'auto',
  wrap_attributes_indent_size: 4,
  end_with_newline: true,
  js: {
    file_types: ['.js']
  },
  css: {
    file_types: ['.scss'],
    selector_separator_newline: true,
    newline_between_rules: true
  },
  html: {
    file_types: ['.html'],
    indent_inner_html: false
  }
};

gulp.task('prettify-js', () => {
  gulp.src('*.js')
    .pipe($.jsbeautifier(options))
    .pipe(gulp.dest('.', {
      overwrite: true
    }));
});

gulp.task('prettify-gulp-js', () => {
  gulp.src(`${conf.paths.gulp}/*.js`)
    .pipe($.jsbeautifier(options))
    .pipe(gulp.dest(`${conf.paths.gulp}/`, {
      overwrite: true
    }));
});

gulp.task('prettify-e2e-js', () => {
  gulp.src(`${conf.paths.e2e}/**/*.js`)
    .pipe($.jsbeautifier(options))
    .pipe(gulp.dest(`${conf.paths.e2e}/`, {
      overwrite: true
    }));
});

gulp.task('prettify-src-js', () => {
  gulp.src(`${conf.paths.src}/**/*.js`)
    .pipe($.jsbeautifier(options))
    .pipe(gulp.dest(`${conf.paths.src}/`, {
      overwrite: true
    }));
});

gulp.task('prettify-src-css', () => {
  gulp.src(`${conf.paths.src}/**/*.scss`)
    .pipe($.jsbeautifier(options))
    .pipe(gulp.dest(`${conf.paths.src}/`, {
      overwrite: true
    }));
});

gulp.task('prettify-src-html', () => {
  gulp.src(`${conf.paths.src}/**/*.html`)
    .pipe($.jsbeautifier(options))
    .pipe(gulp.dest(`${conf.paths.src}/`, {
      overwrite: true
    }));
});

gulp.task('prettify', [
  'prettify-js',
  'prettify-gulp-js',
  'prettify-e2e-js',
  'prettify-src-js',
  'prettify-src-css',
  'prettify-src-html'
]);
