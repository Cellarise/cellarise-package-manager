"use strict";

/* Feature: Auto-update task: Add a bulk task runner to update one or more projects */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var vasync = require("vasync");

  return English.library()
    /*Scenario:  */
    .define("Given repository $repository", function test(repository, done) {
      this.world.repository = repository;
      assert(this.world.repository !== "");
      done();
    })
    .define("When auto-updating with $updateCheckTask $updateSourceTask $updateSourceType $bambooBuildTask " +
    "and $bambooPostBuildTask",
    function test(updateCheckTask,
                  updateSourceTask,
                  updateSourceType,
                  bambooBuildTask,
                  bambooPostBuildTask,
                  done) {
      this.world.opts = {
        "BUILD_DIR": "Auto_Build",
        "category": "X",
        "include": [this.world.repository],
        "exclude": [],
        "updateCheck": true,
        "updateCheckTask": updateCheckTask,
        "updateSource": true,
        "updateSourceTask": updateSourceTask,
        "updateSourceSummary": "Package: Test",
        "updateSourceType": updateSourceType,
        "bambooBuildTask": bambooBuildTask,
        "bambooPostBuildTask": bambooPostBuildTask,
        "releaseVersion": true,
        "repositoryUrl": require("../../../../lib/utils/config")("github").repositoryUrl
      };
      assert(true);
      done();
    })
    .define("Then the repository is automatically updated", function test(done) {
      var logger = this.world.logger;
      var utilsJira = require("../../../../lib/utils/jira")(logger);
      var utilsAutoUpdate = require("../../../../lib/utils/autoUpdate")(logger);

      utilsAutoUpdate.autoUpdate(this.world.opts, function autoUpdateCallback(err, results) {
        if (err) {
          logger.error(err);
          assert(false);
          done();
        } else {
          //delete issue and version
          vasync.parallel({
            "funcs": [
              function deleteJiraIssue(callback) {
                assert(results[0].updateSourceJiraIssue !== null, "updateSourceJiraIssue <> null");
                assert(results[0].bambooTest !== null, "bambooTest <> null");
                if (results[0].updateSourceJiraIssue) {
                  utilsJira.deleteIssue(results[0].updateSourceJiraIssue.key,
                    function deleteJiraIssueCallback(err1) {
                      logger.info("Deleted issue: " + results[0].updateSourceJiraIssue.key);
                      assert(!err1);
                      callback();
                    });
                } else {
                  callback();
                }
              },
              function deleteJiraVersion(callback) {
                assert(results[0].releasedVersion !== null, "releasedVersion <> null");
                if (results[0].releasedVersion) {
                  utilsJira.deleteVersion(
                    results[0].project.key,
                    results[0].releasedVersion.name,
                    function deleteJiraVersionCallback(err1) {
                      logger.info("Deleted version: " + results[0].releasedVersion.name);
                      assert(!err1);
                      callback();
                    });
                } else {
                  callback();
                }
              }
            ]
          }, done);
          //check results

        }
      });
    });
})();
