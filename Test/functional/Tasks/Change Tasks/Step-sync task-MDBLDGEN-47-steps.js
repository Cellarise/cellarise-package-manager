"use strict";

/* Feature: Steps task: Automate synchronisation of BDD test scripts from JIRA. */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var path = require("path");
  var fs = require("fs");

  return English.library()
    /*Scenario: Add missing steps */
    .define("And the existing Test step features are cleared", function test(done) {
      var self = this;
      var execUtils = require("../../../../bin/exec")(this.world.logger);
      //clear Test/functional folder
      var testFuncFolder = path.join(this.world.dir, "Test/functional");
      execUtils.clearFiles(testFuncFolder + "\\*.feature", function clearFilesCallback(err) {
        assert(!fs.existsSync(path.join(self.world.dir, "Test/functional/Feature2-MDTEST-117.feature")));
        done(err);
      });

    })
    .define("Then the expected step features are produced", function test(done) {
      assert.equal(
        fs.readFileSync(
          path.join(this.world.dir, "Test/functional/Feature2-MDTEST-117.feature"))
          .toString()
          .replace(/\r/g, ""),
        fs.readFileSync(
          path.join(process.cwd(), "Test_Resources/Test_Resources/functional/Feature2-MDTEST-117.feature"))
          .toString()
          .replace(/\r/g, ""));
      done();
    });
})();
