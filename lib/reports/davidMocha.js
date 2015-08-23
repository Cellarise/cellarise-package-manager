"use strict";

/**
 * David mocha report
 * @exports reports/davidMocha
 * @returns {Object} David mocha report functions
 */
module.exports = function davidMocha() {
  var david = require("david");
  var base = require("./baseMocha")();

  var exports = {
    /**
     * Prepare the report header
     * @param {String} start - start time and date
     * @param {String} end - end time and date (will be overwritten by write report function)
     * @returns {Object} the report header
     */
    "prepare": base.prepare,
    /**
     * Write a new test
     * @param {Object} opts - the david options
     * @param {String} opts.suite - the test suite name
     * @param {Object} pkgs - the package dependency analysis returned by david
     * @param {String} pkg - the package to write test for
     * @param {Object} rpt - the report object to write or add the test result to
     */
    "write": function writeTest(opts, pkgs, pkg, rpt) {
      if (david.isUpdated(pkgs[pkg]) && !pkgs[pkg].warn && pkgs[pkg].required !== "^" + pkgs[pkg].stable) {
        base.write(opts.suite, false, {
          "title": pkg,
          "fullTitle": opts.suite + ": " + pkg,
          "duration": 0,
          "error": pkg + " | Required: " + pkgs[pkg].required + " Stable: " + pkgs[pkg].stable
        }, rpt);
      } else {
        base.write(opts.suite, true, {
          "title": pkg,
          "fullTitle": opts.suite + ": " + pkg,
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
