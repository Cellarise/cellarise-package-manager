"use strict";

/**
 * Generic mocha report
 * @exports reports/genericMocha
 * @returns {Object} Generic mocha report functions
 */
module.exports = function genericMocha() {
  var base = require("./baseMocha")();

  var exports = {
    /**
     * Prepare the report header
     * @returns {Object} the report header
     */
    "prepare": function prepare() {
      return base.prepare();
    },
    /**
     * Write a new test
     * @param {String} suiteName - the test suite name
     * @param {String} testName - the test name
     * @param {Array} errorMessages - the error messages if the test failed
     * @param {Object} rpt - the report object to write or add the test result to
     */
    "write": function writeTest(suiteName, testName, errorMessages, rpt) {
      if (errorMessages.length > 0) {
        base.write(suiteName, false, {
          "title": testName,
          "fullTitle": suiteName + ": " + testName,
          "duration": 0,
          "error": errorMessages.join("\n")
        }, rpt);
      } else {
        base.write(suiteName, true, {
          "title": testName,
          "fullTitle": suiteName + ": " + testName,
          "duration": 0
        }, rpt);
      }
      //no return - rpt past by reference
    },
    /**
     * Synchronously write a test report to a file location
     * @param {String} reportPath - the file path including filename
     * @param {Object} report - the report object containing report header and results
     */
    "writeToFileSync": base.writeToFileSync
  };

  return exports;
};
