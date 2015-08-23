"use strict";
/* Feature: Post_build task: Add post build verification test task */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var path = require("path");
  var fs = require("fs");
  /*eslint camelcase:1*/
  process.env.bamboo_buildNumber = "23";//set for metadata testing

  return English.library()
  /*Scenario: Post verification of successfully executed package task */
    .define("Then the post_build check passes",
      function test(done) {
        var actualTestReport = JSON.parse(fs.readFileSync(path.join(this.world.dir,
            "Reports/postBuild-mocha-tests.json")).toString());
        assert.equal(actualTestReport.failures.length, 0);
        done();
      })/*Scenario: Post verification of unsuccessfully executed package task */
    .define("Then the post_build check fails",
      function test(done) {
        var actualTestReport = JSON.parse(fs.readFileSync(path.join(this.world.dir,
            "Reports/postBuild-mocha-tests.json")).toString());
        assert.notEqual(actualTestReport.failures.length, 0);
        done();
      });
})();
