"use strict";

/**
 * Post build cucumber report
 * @exports reports/postBuildCucumber
 * @param {String} suiteName - the test suite name
 * @param {Array} results - post build results returned as an array of object test results.
 * The test result object contains two properties `testName` and `errMessage`
 * e.g. `{testName: "test description", errMessage: "error message"}`
 * @param {String} [reportPath] - the file path including filename
 * @returns {Object} Post build cucumber report in JSON
 */
module.exports = function postBuildCucumber(suiteName, results, reportPath) {
  var base = require("./genericCucumber")();
  var report = base.prepare(
    "feature",
    "Post build verification test",
    "As a developer\n" +
    "I can run post build verification tests\n" +
    "So that I can catch incomplete builds which failed to complete tests and packaging tasks");

  results.forEach(function eachResult(result) {
    base.write(
      suiteName,
      result.testName,
      result.errorMessages,
      /*Given */"the build task has completed",
      /*When */"performing the post build verification test",
      /*Then */"the test should pass",
      report);
  });

  if (reportPath){
    base.writeToFileSync(reportPath, report);
  }
  return report;
};
