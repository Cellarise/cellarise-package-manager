"use strict";
/**
 * A module to add gulp tasks which run test steps.
 * @exports tasks/serversTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function serversTasks(gulp, context) {
  var cwd = context.cwd;
  var childProcess = require('child_process');
  var fs = require('fs');
  var path = require('path');
  var mkdirp = require("mkdirp");

  /**
   * A gulp build task to start Selenium
   * @alias tasks:startSelenium
   */
  gulp.task('start-selenium', function startSelenium(cb) {
    var SELENIUM_PORT = process.env.SELENIUM_PORT || '4444';
    var out, err, server, serverPid;
    mkdirp.sync("Temp");
    out = fs.openSync('./Temp/selenium-' + SELENIUM_PORT + '.log', 'a');
    err = fs.openSync('./Temp/selenium-' + SELENIUM_PORT + '.log', 'a');
    server = childProcess.spawn(
      path.join(__dirname, "../../bin", 'selenium.bat'),
      [SELENIUM_PORT], {
        'stdio': ['ignore', out, err],
        'detached': true
      });
    serverPid = server.pid;
    server.unref();
    fs.writeFile(
      path.join(cwd, "Temp", 'selenium-' + SELENIUM_PORT + '.json'),
      JSON.stringify({"pid": serverPid}), 'utf8',
      cb
    );
  });

  /**
   * A gulp build task to start Loopback in test mode
   * @alias tasks:startLoopback
   */
  gulp.task('start-loopback', function startLoopback(cb) {
    var out, err, server, serverPid;
    mkdirp.sync("Temp");
    out = fs.openSync('./Temp/loopback.log', 'a');
    err = fs.openSync('./Temp/loopback.log', 'a');
    server = childProcess.spawn('node', ['server/server.js'], {
      'stdio': ['ignore', out, err],
      'detached': true,
      'env': {
        'PORT': process.env.PORT || 3002,
        'NODE_ENV': 'development',
        'CELLARISE_COVERAGE': 'true'
      }
    });
    serverPid = server.pid;
    server.unref();
    fs.writeFile(path.join(cwd, "Temp", 'loopback.json'), JSON.stringify({"pid": serverPid}), 'utf8', cb);
  });

  /**
   * A gulp build task to kill Loopback in test mode
   * @alias tasks:killLoopback
   */
  gulp.task('kill-loopback', function killLoopback(cb) {
    fs.readFile(path.join(cwd, "Temp", 'loopback.json'), 'utf8', function cbRF(err, data) {
      if (err || !data) {
        return cb(err);
      }
      childProcess.exec('taskkill /pid ' + JSON.parse(data).pid + ' /T /F', cb);
    });
  });

  /**
   * A gulp build task to kill Selenium in test mode
   * @alias tasks:killSelenium
   */
  gulp.task('kill-selenium', function killSelenium(cb) {
    var SELENIUM_PORT = process.env.SELENIUM_PORT || '4444';
    fs.readFile(path.join(cwd, "Temp", 'selenium-' + SELENIUM_PORT + '.json'), 'utf8', function cbRF(err, data) {
      if (err || !data) {
        return cb(err);
      }
      childProcess.exec('taskkill /pid ' + JSON.parse(data).pid + ' /T /F', cb);
    });
  });

};
