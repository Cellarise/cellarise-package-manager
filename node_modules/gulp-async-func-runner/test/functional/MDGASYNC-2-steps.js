"use strict";

/* Feature: Package: Develop asynchronous function runner. */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var gulp = require("gulp");
  var asyncPipe = require("../..");

  return English.library()
    /*Scenario: Simple asynchronous function execution */
    .define("Given a simple asynchronous function", function test(done) {
      this.world.asyncFunc = function testFunc(opts, cb) {
        assert.equal(opts.testOpt, "test option");
        cb(false, "test data");
      };
      done();
    })
    .define("When executing the function as part of a gulp pipe", function test(done) {
      assert(true);
      done();
    })
    .define("Then the pipe will wait for function to complete before continuing", function test(done) {
      var asyncFuncComplete = false;
      var self = this;
      var opts = {
        "oneTimeRun": true,
        "passThrough": true,
        "testOpt": "test option"
      };
      gulp.src("test/*")
        .pipe(asyncPipe(
          opts,
          function testFunc(opts1, chunk, cb) {
            self.world.asyncFunc(opts1, cb);
          },
          function testFuncCallback(error, data) {
            if (!error) {
              assert.equal(data, "test data");
            } else {
              assert(false);
            }
            asyncFuncComplete = true;
          }))
        .on("finish", function onFinish() {
          assert(asyncFuncComplete, "async function complete = " + asyncFuncComplete);
          done();
        });
    });
})();
