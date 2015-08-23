"use strict";

/**
 * Base methods for cucumber reports
 * @exports reports/baseCucumber
 * @returns {Object} Base cucumber report functions
 */
module.exports = function baseCucumber() {
  var currentSuite = "";
  var fs = require("fs");
  var path = require("path");
  var mkdirp = require("mkdirp");

  var exports = {
    /**
     * Prepare the report header
     * @param {String} type - the test report type (e.g. feature, bug)
     * @param {String} name - the test report name
     * @param {String} description - the test report description
     * @returns {Object} the report header
     */
    "prepare": function prepare(type, name, description) {
      var nameNoSpaces = name.replace(/\s/g, "-");
      return [
        {
          "id": nameNoSpaces + "-" + type,
          "uri": type + "s/" + nameNoSpaces + ".feature",
          "keyword": type,
          "name": name,
          "line": 1,
          "description": description,
          "elements": []
        }
      ];
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
      rpt.stats.duration = (rpt.stats.end - rpt.stats.start) / 1000;
      //no return - rpt past by reference
    },
    /**
     * Synchronously write a test report to a file location
     * @param {String} reportPath - the file path including filename
     * @param {Object} report - the report object containing report header and results
     */
    "writeToFileSync": function writeToFileSync(reportPath, report) {
      var cucumberReport;
      if (fs.existsSync(reportPath)){
        cucumberReport = JSON.parse(fs.readFileSync(reportPath, "utf8"));
        cucumberReport.push(report[0]);
      } else {
        mkdirp.sync(path.dirname(reportPath)); //make sure the Reports directory exists
        cucumberReport = report;
      }
      fs.writeFileSync(reportPath, JSON.stringify(cucumberReport, null, 2));
    }
  };

  return exports;
};
