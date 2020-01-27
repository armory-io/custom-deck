'use strict';

process.env.CHROME_BIN = require('puppeteer').executablePath();

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const prodWebpackConfig = require('./webpack.config');
const webpackConfig = {
  mode: 'development',
  module: prodWebpackConfig.module,
  resolve: prodWebpackConfig.resolve,
  node: {
    fs: "empty"
  },
  plugins: [new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true, tslint: true })],
};

module.exports = function(config) {
  config.set({
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '.',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [{ pattern: './karma-shim.js', watched: false }],

    preprocessors: {
      './karma-shim.js': ['webpack', 'sourcemap'],
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'minimal',
    },

    customLaunchers: {
      ChromeCustom: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--user-data-dir=/tmp/chrome-test-profile',
          '--override-plugin-power-saver-for-testing=0',
          '--disable-web-security'
        ],
      },
    },

    plugins: [
      require('karma-webpack'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-junit-reporter'),
      require('karma-sourcemap-loader'),
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8081,

    browsers: ['ChromeCustom'],

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.DEBUG,

    // jUnit Report output
    reporters: ['dots'],

    // put test results in a well known file if 'jenkins' reporter is being used
    junitReporter: {
      outputFile: 'test-results.xml',
    },

    client: {
      captureConsole: true,
    },

    browserNoActivityTimeout: 200000,
  });
};
