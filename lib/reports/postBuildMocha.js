"use strict";

/**
 * Post build mocha report
 * @exports reports/postBuildMocha
 * @param {String} suiteName - the test suite name
 * @param {Array} results - post build results returned as an array of object test results.
 * The test result object contains two properties `testName` and `errMessage`
 * e.g. `{testName: "test description", errMessage: "error message"}`
 * @param {String} [reportPath] - the file path including filename
 * @returns {Object} Post build mocha report in JSON
 */
module.exports = function postBuildMocha(suiteName, results, reportPath) {
  var base = require("./genericMocha")();
  var report = base.prepare();

  results.forEach(function eachResult(result) {
    base.write(
      suiteName,
      result.testName,
      result.errorMessages,
      report);
  });

  if (reportPath){
    base.writeToFileSync(reportPath, report);
  }
  return report;
};
