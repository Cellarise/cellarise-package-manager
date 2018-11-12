"use strict";

/**
 * David cucumber report
 * @exports reports/davidCucumber
 * @returns {Object} David cucumber report functions
 */
module.exports = function davidCucumber() {
  var david = require("david");
  var base = require("./baseCucumber")();

  var exports = {
    /**
     * Prepare the report header
     * @returns {Object} the report header
     */
    "prepare": function prepare() {
      return base.prepare(
        "feature",
        "David dependency analysis",
          "As a developer\n" +
          "I want to keep my package dependencies up to date\n" +
          "So that my package is up to date with bug fixes and security patches");
    },
    /**
     * Write a new test
     * @param {Object} opts - the david options
     * @param {String} opts.suite - the test suite name
     * @param {Object} pkgs - the package dependency analysis returned by david
     * @param {String} pkg - the package to write test for
     * @param {Object} rpt - the report object to write or add the test result to
     */
    "write": function writeTest(opts, pkgs, pkg, rpt) {
      var result = {
        "id": pkg.replace(/.*[\\/]/, ""),
        "keyword": "Scenario",
        "name": opts.suiteName + " - " + pkg.replace(/.*[\\/]/, ""),
        "line": 3,
        "description": opts.suiteName + " - " + pkg,
        "type": "scenario",
        "steps": [
          {
            "result": {
              "duration": 0,
              "status": "passed"
            },
            "name": "the package dependency " + pkg,
            "keyword": "Given ",
            "line": 4
          },
          {
            "result": {
              "duration": 0,
              "status": "passed"
            },
            "name": "analysed using David",
            "keyword": "When ",
            "line": 5
          },
          {
            "result": {
              "duration": 0,
              "status": "passed"
            },
            "name": "the dependency should be current",
            "keyword": "Then ",
            "line": 6
          }
        ]
      };
      //need to perform (pkgs[pkg].required !==  "^" + pkgs[pkg].stable) due to issue found with through2
      if (david.isUpdated(pkgs[pkg]) && !pkgs[pkg].warn && pkgs[pkg].required !== "^" + pkgs[pkg].stable) {
        result.steps[2].result.status = "failed";
        /*eslint camelcase:0*/
        result.steps[2].result.error_message =
          pkg + " | Required: " + pkgs[pkg].required + " Stable: " + pkgs[pkg].stable;
      }
      rpt[0].elements.push(result);
      //no return - rpt past by reference
    },
    "writeToFileSync": base.writeToFileSync
  };

  return exports;
};
