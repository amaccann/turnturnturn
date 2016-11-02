#! /usr/bin/env node
(function () {
  'use strict';

  var browserify = require('browserify'),
    fs = require('fs'),
    browserSync = require('browser-sync'),
    path = './app/',
    jsDestination = (path + 'public/bundle.js'),
    files;

  function noop(){}

  /**
   * @method bundle
   * @param {Function} callback
   */
  function bundle(callback) {
    console.info('[BROWSERIFY] Bundling...');
    browserify('.').bundle(function (error, buffer) {
      
      if (error) {
        return console.error(error);
      }

      console.info('[BROWSERIFY] Writing to', jsDestination);
      fs.writeFile(jsDestination, buffer, (callback || noop));
    });
  }

  /**
   * @method onJsEvent
   * @param {String} event
   */
  function onJsEvent(event) {
    if (event !== 'change') {
      return;
    }

    bundle();
  }

  files = [
    'app/public',
    {
      match: 'app/js/**/*.{js,jsx}',
      fn: onJsEvent
    }
  ];

  bundle(function () {
    browserSync.init(files, {
      server: {
        baseDir: path
      }
    });
  });

}());
