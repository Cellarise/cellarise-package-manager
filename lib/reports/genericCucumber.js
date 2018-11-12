"use strict";

/**
 * Generic cucumber report
 * @exports reports/genericCucumber
 * @returns {Object} Generic cucumber report functions
 */
module.exports = function davidCucumber() {
  var base = require("./baseCucumber")();

  var exports = {
    /**
     * Prepare the report header
     * @param {String} type - the test report type (e.g. feature, bug)
     * @param {String} name - the test report name
     * @param {String} description - the test report description
     * @returns {Object} the report header
     */
    "prepare": base.prepare,
    /**
     * Write a new test
     * @param {String} suiteName - the test suite name
     * @param {String} testName - the test name
     * @param {Array} errorMessages - the error messages if the test failed
     * @param {String} givenDesc - the given step part description
     * @param {String} whenDesc - the when step part description
     * @param {String} thenDesc - the then step part description
     * @param {Object} rpt - the report object to write or add the test result to
     */
    "write": function writeTest(suiteName, testName, errorMessages, givenDesc, whenDesc, thenDesc, rpt) {
      var result = {
        "id": testName.replace(/.*[\\/]/, ""),
        "keyword": "Scenario",
        "name": testName,
        "line": 3,
        "description": suiteName + ": " + testName,
        "type": "scenario",
        "steps": [
          {
            "result": {
              "duration": 0,
              "status": "passed"
            },
            "name": givenDesc,
            "keyword": "Given ",
            "line": 4
          },
          {
            "result": {
              "duration": 0,
              "status": "passed"
            },
            "name": whenDesc,
            "keyword": "When ",
            "line": 5
          },
          {
            "result": {
              "duration": 0,
              "status": "passed"
            },
            "name": thenDesc,
            "keyword": "Then ",
            "line": 6
          }
        ]
      };
      if (errorMessages.length > 0) {
        result.steps[2].result.status = "failed";
        /*eslint camelcase:0*/
        result.steps[2].result.error_message = errorMessages.join("\n");
      }
      rpt[0].elements.push(result);
      //no return - rpt past by reference
    },
    "writeToFileSync": base.writeToFileSync
  };

  return exports;
};
