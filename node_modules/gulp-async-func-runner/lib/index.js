"use strict";
var through2 = require("through2");
var gutil = require("gulp-util");
var PLUGIN_NAME = "gulp-async-function-runner";

/**
 * {description}
 * @module {name}
 * @param {Object} opts - optional options. Options to be passed to the task function should be provided in this object.
 * @param {Object} [opts.oneTimeRun=false] - flag to run the task only once no matter how many data chunks are passed
 * through the stream
 * @param {Object} [opts.passThrough=false] - flag to pass data chunks through without modification.
 * Default behaviour is to stream the data transformed by the asynchronous function.
 * Set to passThrough to true if you only want to use the results of the asynchronous function as part of the
 * `done` callback function.
 * @param {Function} task - the asynchronous task to call and wait for callback to be executed.
 * The task must be a function with the following signature: task(options, chunk, enc, callback)
 *    - options {Object} - an options object. This will be passed the opts parameter from this module.
 *    - chunk {Object} - the current chunk of data passing through stream.
 *    - callback {Function} - the callback function to be executed once task complete.
 *    The callback function has the following signature: callback(error, data).
 *    This will be passed the done parameter from this module which must have a matching signature.
 * @param {Function} done - the callback function called once the asynchronous task has completed.
 * The function must have the following signature: done(error, data).
 * @returns {through2} readable-stream/transform
 * @example @lang off
 {>example-index/}
 */
module.exports = function asyncFunc(opts, task, done) {
  var processed = false; //flag to ensure only onetime run
  //check options
  opts = opts || {};
  if (typeof opts.oneTimeRun === 'undefined') { opts.oneTimeRun = false; }
  if (typeof opts.passThrough === 'undefined') { opts.passThrough = false; }

  return through2.obj(function asyncFuncTransform(chunk, enc, cb) {
    var self = this;
    if (chunk.isNull()) {
      this.push(chunk);
      return cb();
    }

    if (chunk.isStream()) {
      return cb(new gutil.PluginError(PLUGIN_NAME, "streams not supported"));
    }

    //if oneTimeRun then ensure this has not already been processed
    if (!opts.oneTimeRun || opts.oneTimeRun && !processed) {
      processed = true;
      task(opts, chunk, function taskCallback(error, data) {
        done(error, data);
        if (!opts.passThrough && !error) {
          self.push(data);
        } else {
          self.push(chunk);
        }
        return cb();
      });
    } else {
      this.push(chunk);
      return cb();
    }
  });
};
