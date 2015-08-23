"use strict";
/* Feature: Develop clover-style json report with source-map support */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  return English.library()
    /*Scenario: Code coverage report with no source maps */
    .define("When I run the coverage report on the files",
      function test(done) {
        assert(true);
        done();
      })/*Scenario: Code coverage report with source maps */
    /*Scenario: Code coverage report with no source maps */
    .define("Given I have a non-bundled Javascript file",
      function test(done) {
        assert(true);
        done();
      })
    .define("Then a report is produced referencing the non-bundled files",
      function test(done) {
        assert(true);
        done();
      })/*Scenario: Code coverage report with source maps */
    .define("Given I have a bundled Javascript file",
      function test(done) {
        assert(true);
        done();
      })
    .define("When I execute the coverage report on the file",
      function test(done) {
        assert(true);
        done();
      });
})();
