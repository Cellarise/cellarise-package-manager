"use strict";

/**
 * Base methods for mocha reports
 * @exports reports/baseMocha
 * @returns {Object} Base mocha report functions
 */
module.exports = function baseMocha() {
  var currentSuite = "";

  var exports = {
    /**
     * Prepare the report header
     * @param {String} [start=new global.Date()] - start time and date
     * @param {String} [end=new global.Date()] - end time and date (will be overwritten by write report function)
     * @returns {Object} the report header
     */
    "prepare": function prepare(start, end) {
      start = start || new global.Date();
      end = end || new global.Date();
      return {
        "stats": {
          "suites": 0,
          "tests": 0,
          "passes": 0,
          "pending": 0,
          "failures": 0,
          "start": start,
          "end": end,
          "duration": 0
        },
        "failures": [],
        "passes": [],
        "skipped": []
      };
    },
    /**
     * Write a new test
     * @param {String} suite - the test suite name
     * @param {Boolean} pass - has the test passed?
     * @param {String} message - the test description message
     * @param {Object} rpt - the report object to write or add the test result to
     */
    "write": function writeTest(suite, pass, message, rpt) {
      //increment suite based on opt.suite
      if (currentSuite !== suite) {
        rpt.stats.suites = rpt.stats.suites + 1;
        currentSuite = suite;
      }
      rpt.stats.tests = rpt.stats.tests + 1;

      if (pass) {
        rpt.stats.passes = rpt.stats.passes + 1;
        rpt.passes.push(message);
      } else {
        rpt.stats.failures = rpt.stats.failures + 1;
        rpt.failures.push(message);
      }

      rpt.stats.end = new global.Date();
      rpt.stats.duration = Math.round((rpt.stats.end - rpt.stats.start) / 1000);
      //no return - rpt past by reference
    },
    /**
     * Synchronously write a test report to a file location
     * @param {String} reportPath - the file path including filename
     * @param {Object} report - the report object containing report header and results
     */
    "writeToFileSync": function writeToFileSync(reportPath, report) {
      var fs = require("fs");
      var path = require("path");
      var mkdirp = require("mkdirp");
      mkdirp.sync(path.dirname(reportPath)); //make sure the Reports directory exists
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    }
  };

  return exports;
};
