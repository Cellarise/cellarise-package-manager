"use strict";

/* Feature: Develop a gulp task loader with parameters */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var should = require("should");
  var gulp = require("gulp");
  var path = require("path");

  return English.library()
    /*Scenario: gulp-load */
    .define("Given I have initialised gulp-load", function test(done) {
      this.world.load = require("../..")(gulp);
      done();
    })
    .define("When I call gulp loadTasks", function test(done) {
      this.world.loadTasks = gulp.loadTasks;
      done();
    })
    .define("Then it should be equal to the function returned from gulp-load", function test(done) {
      this.world.load.should.be.eql(this.world.loadTasks);
      done();
    })/*Scenario: load single file */
    .define("When I load a file with a gulp task", function test(done) {
      this.world.load(path.join(__dirname, "../task.js"));
      done();
    })
    .define("Then the gulp task in file should exist", function test(done) {
      should.exist(gulp.tasks.a);
      done();
    })/*Scenario: load specified module */
    .define("When I load a module with gulp tasks", function test(done) {
      this.world.load(path.join(__dirname, "../gulp-module"));
      done();
    })
    .define("Then the gulp task in module should exist", function test(done) {
      should.exist(gulp.tasks.b);
      should.exist(gulp.tasks.c);
      done();
    })
    .define("Given I have initialised gulp-load using a custom module prefix", function test(done) {
      this.world.loadCustom = require("../..")(gulp, {"modulePrefix": "task-"});
      done();
    })
    .define("When I load a module with gulp tasks using a custom module prefix", function test(done) {
      this.world.loadCustom(path.join(__dirname, "../gulp-module"));
      done();
    })
    .define("Then the gulp task in custom prefixed module should exist", function test(done) {
      should.exist(gulp.tasks.b);
      should.exist(gulp.tasks.e);
      done();
    })
    /*Scenario: gulp-load-global */
    .define("When I load a global module with gulp tasks", function test(done) {
      this.world.load("gulp-load-global");
      done();
    })
    .define("Then the gulp task in global module should not exist", function test(done) {
      should.not.exist(gulp.tasks.d);
      done();
    })/*Scenario: ignore when not exist */
    .define("When I load a module with dependencies which do not exist", function test(done) {
      done();
    })
    .define("Then the no error should be thrown", function test(done) {
      var self = this;
      /*eslint no-extra-parens:0, no-wrap-func: 0*/
      (function errorFunc() {
        self.world.load(path.join(__dirname, "../noexist"));
      }).should.not.throw();
      done();
    })/*Scenario: pass parameter */
    .define("When I load a file with a gulp task and pass parameters", function test(done) {
      done();
    })
    .define("Then the gulp task in file should exist and read the parameters", function test(done) {
      done();
    });
})();
