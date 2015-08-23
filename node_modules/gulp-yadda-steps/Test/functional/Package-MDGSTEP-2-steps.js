"use strict";

module.exports = (function testSuite() {
  var fs = require("fs");
  var gulp = require("gulp");
  var path = require("path");
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var Parser = require("../../lib/index").Parser;
  var Render = require("../../lib/index").Render;
  var Both = require("../../lib/index");

  return English.library()
    /*Scenario: Generating test steps*/
    .define("Given I have a $Name (?:feature|json) (?:file|output)", function test(filename, done) {
      this.world.feature = filename;
      done();
    })
    .given("the test steps file doesn't already exist", function test(done) {
      assert(!fs.existsSync(path.join(__dirname, "../testStepLibrary/" + this.world.feature) + "-steps.js"));
      done();
    })
    .when("I parse the feature file", function test(done) {
      var self = this;
      this.world.streamResult = [];
      gulp.src(path.join(__dirname, "../testFeatures/" + this.world.feature) + ".feature")
        .pipe(new Parser({
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
    .when("I render the json output", function test(done) {
      var self = this;
      this.world.streamResult = [];
      gulp.src(path.join(__dirname, "../testStepLibrary/" + this.world.feature) + "-steps.json")
        .pipe(new Render())
        .on("data", function onData(vinyl) {
          self.world.streamResult.push(vinyl.contents);
        })
        .on("end", function onEnd() {
          done();
        });
    })
    .when("I parse and render the feature file", function test(done) {
      var self = this;
      this.world.streamResult = [];
      gulp.src(path.join(__dirname, "../testFeatures/" + this.world.feature) + ".feature")
        .pipe(new Both({
          "libraryBasePath": path.join(process.cwd(), "./Test/testStepLibrary"),
          "featureBasePath": path.join(process.cwd(), "./Test/testFeatures")
        }))
        .on("data", function onData(vinyl) {
          self.world.streamResult.push(vinyl.contents);
        })
        .on("end", function onEnd() {
          assert(true);
          done();
        });
    })
    .define("Then a yadda json output is generated", function test(done) {
      assert.deepEqual(JSON.parse(this.world.streamResult.join("")),
        require(
            path.join(__dirname, "../testStepLibrary/") +
            this.world.feature + "-steps.json"));
      done();
    })
    .define("Then a test steps script is generated", function test(done) {
      assert.equal(this.world.streamResult.join(""),
        fs.readFileSync(
            path.join(__dirname, "../testStepLibrary/") +
            this.world.feature + "-steps.expected.js", "UTF-8"));
      done();
    });
})();
