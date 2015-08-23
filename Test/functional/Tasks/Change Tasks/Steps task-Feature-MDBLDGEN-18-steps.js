"use strict";

/* Feature: Steps task: Automate synchronisation of BDD test scripts from JIRA. */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var path = require("path");
  var fs = require("fs");

  return English.library()
    /*Scenario: Create step libraries */
    .define("And the existing Test step libraries are cleared", function test(done) {
      var execUtils = require("../../../../bin/exec")(this.world.logger);
      //clear Test/functional folder
      var testFuncFolder = path.join(this.world.dir, "Test/functional");
      //clear all libraries except for the MDTEST-1 to test use of existing step libraries
      execUtils.clearFiles(testFuncFolder + "\\*11*.js", function clearFilesCallback(err) {
        done(err);
      });

    })
    .define("Then the expected step libraries are produced", function test(done) {
      assert.equal(
        fs.readFileSync(
          path.join(this.world.dir, "Test/functional/Feature2-MDTEST-117-steps.js"))
          .toString()
          .replace(/\r/g, ""),
        fs.readFileSync(
          path.join(process.cwd(), "Test_Resources/Test/functional/Feature2-MDTEST-117-steps.js"))
          .toString()
          .replace(/\r/g, ""));
      done();
    });
})();
