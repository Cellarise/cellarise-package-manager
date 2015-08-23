"use strict";

/**
 * Auto update mocha report
 * @exports reports/autoUpdateMocha
 * @returns {Object} Auto update mocha report functions
 */
module.exports = function autoUpdateMocha() {
  var base = require("./baseMocha")();
  var exports = {
    /**
     * Prepare the report header
     * @param {String} [start=new global.Date()] - start time and date
     * @param {String} [end=new global.Date()] - end time and date (will be overwritten by write report function)
     * @returns {Object} the report header
     */
    "prepare": base.prepare,
    /**
     * Write a new test
     * @param {Object} workflowHistory - the workflow history returned from an auto update
     * @param {Object} rpt - the report object to write or add the test result to
     */
    "write": function writeReport(workflowHistory, rpt) {
      var projectDefinition;
      var pass = true;

      if (workflowHistory.bambooTest && !workflowHistory.bambooTest.successful) {
        pass = false;
      }
      if (workflowHistory.bambooRelease && !workflowHistory.bambooRelease.successful) {
        pass = false;
      }
      //workflow history properties may be incomplete in the event of an error during auto update
      workflowHistory.project = workflowHistory.project ? workflowHistory.project : {};
      workflowHistory.updateCheck = workflowHistory.updateCheck ? workflowHistory.updateCheck : {};
      workflowHistory.updateCheckText = workflowHistory.updateCheckText ? workflowHistory.updateCheckText : {};
      workflowHistory.updateSourceJiraIssue = workflowHistory.updateSourceJiraIssue ?
          workflowHistory.updateSourceJiraIssue : {};
      workflowHistory.bambooTest = workflowHistory.bambooTest ? workflowHistory.bambooTest : {};
      workflowHistory.bambooRelease = workflowHistory.bambooRelease ? workflowHistory.bambooRelease : {};
      workflowHistory.transitionedIssue = workflowHistory.transitionedIssue ? workflowHistory.transitionedIssue : {};
      workflowHistory.releasedVersion = workflowHistory.releasedVersion ? workflowHistory.releasedVersion : {};

      projectDefinition = workflowHistory.project.key + "-" + workflowHistory.project.name;

      if (pass) {
        base.write(projectDefinition, true, {
          "title": projectDefinition,
          "fullTitle": projectDefinition,
          "duration": 0
        }, rpt);
      } else {
        base.write(projectDefinition, false, {
          "title": projectDefinition,
          "fullTitle": projectDefinition,
          "duration": 0,
          "error": projectDefinition + ": \n" +
            "Update required=" + workflowHistory.updateCheck + "\n" +
            "Jira issue=" + workflowHistory.updateSourceJiraIssue.key + "\n" +
            "Test Build=" + workflowHistory.bambooTest.buildNumber + " - " +
            workflowHistory.bambooTest.buildState + "\n" +
            "Release version=" + workflowHistory.releasedVersion.name + "\n" +
            "Unresolved issues=" + workflowHistory.releasedVersion.issuesUnresolvedCount + "\n" +
            "Release Build=" + workflowHistory.bambooRelease.buildNumber + " - " +
            workflowHistory.bambooRelease.buildState + "\n"
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
