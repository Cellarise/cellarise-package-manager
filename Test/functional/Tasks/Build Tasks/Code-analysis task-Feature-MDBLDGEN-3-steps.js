"use strict";

/* Feature: Code-analysis task: Migrate from JSHint to ESLint */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var path = require("path");
  var fs = require("fs");

  return English.library()
    /*Scenario: Run code analysis */
    .define("Then the expected code analysis report documentation is produced", function test(done) {
      var _ = require("underscore");
      //omit entries from *mocha-tests
      var actualTestReport = JSON.parse(fs.readFileSync(path.join(this.world.dir,
        "Reports/lint-mocha-tests.json")).toString());
      var expectedTestReport = JSON.parse(fs.readFileSync(path.join(process.cwd(),
        "Test_Resources/Reports/lint-mocha-tests.json")).toString());

      actualTestReport = JSON.stringify(_.omit(actualTestReport.stats, ["duration", "start", "end"]));
      expectedTestReport = JSON.stringify(_.omit(expectedTestReport.stats, ["duration", "start", "end"]));

      assert.equal(actualTestReport, expectedTestReport);

      done();
    });
})();
