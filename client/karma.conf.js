'use strict';

const path = require('path');
const conf = require('./gulp/conf');

const _ = require('lodash');
const wiredep = require('wiredep');

const pathSrcHtml = [path.join(conf.paths.src, '/**/*.html')];

function listFiles() {
  const wiredepOptions = _.extend({}, conf.wiredep, {
    dependencies: true,
    devDependencies: true
  });

  const patterns = wiredep(wiredepOptions).js
    .concat([
      path.join(conf.paths.src, '/app/**/*.module.js'),
      path.join(conf.paths.src, '/app/**/*.js'),
      path.join(conf.paths.src, '/**/*.spec.js'),
      // path.join(conf.paths.src, '/**/*.mock.js'),
    ])
    .concat(pathSrcHtml);

  const files = patterns.map(pattern => {
    return {
      pattern: pattern
    };
  });

  files.push({
    pattern: path.join(conf.paths.src, '/assets/**/*'),
    included: false,
    served: true,
    watched: false
  });

  return files;
}

module.exports = function (config) {
  config.set({
    files: listFiles(),

    singleRun: true,

    autoWatch: false,

    ngHtml2JsPreprocessor: {
      stripPrefix: conf.paths.src + '/',
      moduleName: 'generatorGulpAngular'
    },

    logLevel: 'WARN',

    frameworks: ['jasmine', 'angular-filesort'],

    angularFilesort: {
      whitelist: [path.join(conf.paths.src, '/**/!(*.html|*.spec|*.mock).js')]
    },

    browsers: [
      'Chrome',
      // 'Firefox',
      // 'PhantomJS'
    ],

    customLaunchers: {
      'chrome-travis-ci': {
        base: 'Chrome',
        flags: ['--no-sandbox']
      },
      'firefox-travis-ci': {
        base: 'Firefox'
      }
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-angular-filesort',
      'karma-coverage',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor'
    ],

    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
      includeAllSources: true
    },

    reporters: ['progress'],

    proxies: {
      '/assets/': path.join('/base/', conf.paths.src, '/assets/')
    },

    preprocessors: _.chain(pathSrcHtml).map((path) => [path, ['ng-html2js']]).fromPairs().value()
  });
};
