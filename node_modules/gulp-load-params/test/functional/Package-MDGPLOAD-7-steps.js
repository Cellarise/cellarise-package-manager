"use strict";

/* Feature: Package: Add option to provide an alternate lookup path for gulp tasks */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var should = require("should");
  var gulp = require("gulp");
  var path = require("path");
  return English.library()
    /*Scenario: load specified module with custom task path */
    .define("Given I have initialised gulp-load using a custom task path", function test(done) {
      this.world.loadCustom = require("../..")(gulp, {"taskPath": "export/tasks"});
      done();
    })
    .define("When I load a module with gulp tasks using a custom task path", function test(done) {
      this.world.loadCustom(path.join(__dirname, "../gulp-module"));
      done();
    })
    .define("Then the gulp task in custom task path should exist", function test(done) {
      should.exist(gulp.tasks.exported);
      done();
    });
})();
