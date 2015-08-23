"use strict";

module.exports = (function testSuite() {
  var gulp = require("gulp");
  var Both = require("../../lib/index");
  var fs = require("fs");
  var path = require("path");
  var English = require("yadda").localisation.English;
  var assert = require("assert");

  return English.library()
    /*Scenario: Generating test steps*/
    .define("And the test step library for the $name feature already exists", function test(filename, done) {
      assert(fs.existsSync(path.join(__dirname, "../testStepLibrary/" + filename) + "-steps.js"));
      done();
    })
    .define("When I parse and render the feature file", function test(done) {
      var self = this;
      this.world.streamResult = [];
      gulp.src(path.join(__dirname, "../testFeatures/" + this.world.feature) + ".feature")
        .pipe(new Both({
          "libraryBasePath": path.join(__dirname, "../testStepLibrary"),
          "featureBasePath": path.join(__dirname, "../testFeatures")
        }))
        .on("data", function onData(vinyl) {
          self.world.streamResult.push(vinyl.contents);
        })
        .on("end", function onEnd() {
          done();
        });
    })
    .define("Then missing steps are added to the existing test step library", function test(done) {
      assert.equal(this.world.streamResult.join(""),
        fs.readFileSync(
            path.join(__dirname, "../testStepLibrary/" +
              this.world.feature) +
            "-steps.expected.js", "UTF-8"));
      done();
    });
})();
