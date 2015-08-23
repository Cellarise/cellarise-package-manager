"use strict";

/**
 * Build report utilities
 * @exports utils/reports
 * @returns {Object} Build report utility functions
 */
module.exports = function reportUtils() {
  var glob = require("glob");
  var fs = require("fs");

  var exports = {
    /**
     * Check all mocha test reports and return true if all tests passed or false if one or more tests failed.
     * @param {String} reportDir - the directory containing the mocha test reports.
     * @returns {Boolean} true if all tests passed or false if one or more tests failed
     */
    "checkReportsPass": function checkReportsPass(reportDir) {
      //get reports
      var reports = glob.sync(process.cwd() + "/" + reportDir + "/**/*mocha-tests.json");
      //iterate over reports
      var i, pass = true;
      for (i = 0; i < reports.length; i = i + 1) {
        if (JSON.parse(fs.readFileSync(reports[i])).stats.failures > 0) {
          pass = false;
        }
      }
      return pass;
    },
    /**
     * Check all mocha test reports and return an array containing all failures.
     * @param {String} reportDir - the directory containing the mocha test reports.
     * @returns {Array} - return array containing all failures
     */
    "getReportFailures": function getReportFailures(reportDir) {
      //get reports
      var reports = glob.sync(process.cwd() + "/" + reportDir + "/**/*mocha-tests.json");
      var rpt;
      var failures = [];
      //iterate over reports
      var i;
      for (i = 0; i < reports.length; i = i + 1) {
        rpt = JSON.parse(fs.readFileSync(reports[i]));
        if (rpt.stats.failures > 0) {
          failures = failures.concat(rpt.failures);
        }
      }
      return failures;
    }
  };

  return exports;
};
