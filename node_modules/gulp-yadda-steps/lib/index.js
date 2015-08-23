"use strict";
var gutil = require("gulp-util");
var PluginError = gutil.PluginError;
var through = require("through2").obj;
var Parser = require("./parser");
var Render = require("./render");
var ReadStream = require("streamifier").createReadStream;

var PLUGIN_NAME = "gulp-yadda-steps";

/**
 * A gulp task to generate or update Yadda test step libraries from Gherkin features (natural language test scripts).
 * @module {name}
 * @param {Object} opts - Task configuration options (see modules Parser and Render for more information)
 * @returns {through2} readable-stream/transform
 * @example
 {>example-index/}
 */
var task = module.exports = function gulpYaddaSteps(opts) {
  opts = opts || {};
  return through(function gulpYaddaStepsTransform(file, enc, cb) {
    var self = this;
    var bufferStream;
    //if (file.isNull()) {
    // Do nothing if no contents
    //}

    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, "streams not supported"));
    }

    if (file.isBuffer()) {
      try {
        bufferStream = new ReadStream(file);
        bufferStream
          .pipe(new Parser(opts))
          .pipe(new Render(opts))
          .on("data", function onData(vinyl) {
            file = vinyl;
            self.push(file);
            cb();
          });
      } catch (err) {
        this.emit("error", new PluginError(PLUGIN_NAME, err, {"fileName": file.path}));
      }
    }
  });
};

task.Parser = Parser;
task.Render = Render;
