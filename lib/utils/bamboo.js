"use strict";

/**
 * Bamboo build utilities
 * @exports utils/bamboo
 * @param {bunyan} logger - A logger matching the bunyan API
 * @returns {Object} Bamboo build utility functions
 */
module.exports = function bambooUtils(logger) {
  var oauthRest = require("oauth-rest-atlassian").rest;
  var config = require("./config")("bamboo");
  var vasync = require("vasync");
  var _ = require("underscore");

  var exports = {
    /**
     * Get build plans from Bamboo.
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "getBuildPlans": function getBuildPlans(cb) {
      //get build plan key
      oauthRest({
        "config": config,
        "query": "plan.json"
      }, cb);
    },

    /**
     * Queue a build on Bamboo.
     * @param {String} buildPlanKey - key for the build plan to be built
     * @param {Object} variables - an object map containing variables to be past to the bamboo build
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "queueBuild": function queueBuild(buildPlanKey, variables, cb) {
      //prepare variables
      var variable;
      var variableStr = "";
      var cnt = 0;
      for (variable in variables) {
        if (variables.hasOwnProperty(variable)) {
          cnt = cnt + 1;
          if (cnt === 1) {
            variableStr = variableStr + "?bamboo.variable." + variable + "=" + variables[variable];
          } else {
            variableStr = variableStr + "&bamboo.variable." + variable + "=" + variables[variable];
          }
        }
      }
      //queue build and get build result key
      oauthRest({
        "config": config,
        "query": "queue/" + buildPlanKey + ".json" + variableStr,
        "method": "post",
        "postData": {
        }
      }, cb);
    },

    /**
     * Get the queue results of a build project on Bamboo.
     * @param {String} buildPlanKey - key for the build plan to be built
     * @param {Integer} maxResults - maximum size for returned list
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "getResults": function getResults(buildPlanKey, maxResults, cb) {
      oauthRest({
        "config": config,
        "query": "result/" + buildPlanKey + ".json?includeAllStates=true&max-results=" + maxResults
      }, cb);
    },

    /**
     * Get the result of a build queued on Bamboo.
     * @param {String} buildPlanKey - key for the build plan to be built
     * @param {String} buildNumber - the build number to get results from
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "getResult": function getResult(buildPlanKey, buildNumber, cb) {
      oauthRest({
        "config": config,
        "query": "result/" + buildPlanKey + "/" + buildNumber + ".json"
      }, cb);
    },

    /**
     * Trigger a build on Bamboo and return the result in the callback.
     * @param {String} buildPlanName - the name of the build plan
     * @param {Object} variables - an object map containing variables to be past to the bamboo build
     * @param {Function} cb - callback function with signature: function(err, result)
     */
    "triggerBamboo": function triggerBamboo(buildPlanName, variables, cb) {
      var self = this;
      var latestBuildNumber = null;

      vasync.waterfall([
        function getBuildPlanKey(callback) {
          self.getBuildPlans(function getBuildPlansCallback(err, data) {
            var buildPlan = _.find(data.plans.plan, function matchPlan(plan) {
              return plan.name.toLowerCase() === buildPlanName;
            });
            callback(err, buildPlan.key);
          });
        },
        function getLastBuildResultKey(buildPlanKey, callback) {
          self.getResults(
            buildPlanKey,
            1,
            function getResultsCallback(err, data) {
              latestBuildNumber = data.results.result[0].buildNumber;
              callback(err, buildPlanKey);
            });
        },
        function queueBuildAndGetResultKey(buildPlanKey, callback) {
          self.queueBuild(
            buildPlanKey,
            variables,
            function queueBuildCallback(err, buildResult) {
              if (err) {
                logger.error(err);
                callback(null, buildPlanKey, buildResult);
              } else {
                callback(err, buildPlanKey, buildResult);
              }
            });
        },
        function getLatestQueuedBuild(buildPlanKey, buildResult, callback) {
          if (!(buildResult && buildResult.buildNumber)) {
            logger.warn("Queue build did not return build result. Attempting to get new build result.");
            self.getResults(
              buildPlanKey,
              1,
              function getResultsCallback(err, data) {
                buildResult = data.results.result[0];
                if (latestBuildNumber === buildResult.buildNumber) {
                  logger.error("Queue build failed to queue a new build. " +
                    "Last build before trigger: " + latestBuildNumber + ". " +
                    "Current build: " + buildResult.buildNumber);
                } else {
                  logger.info("Queue build returned build result: " + buildResult.buildNumber);
                }
                callback(err, buildPlanKey, buildResult);
              });
          } else {
            logger.info("Queue build returned build result: " + buildResult.buildNumber);
            callback(null, buildPlanKey, buildResult);
          }
        },
        function waitForBuildCompletion(buildPlanKey, buildResult, callback) {
          var finished = false;
          var result = {};

          //wait for result
          var whilst = function whilst(test, iterator, callback2) {
            if (test()) {
              iterator(function iteratorCallback(err) {
                if (err) {
                  return callback2(err);
                }
                whilst(test, iterator, callback2);
              });
            } else {
              callback2();
            }
          };

          whilst(
            function buildComplete() {
              return !finished;
            },
            function waitAndCheck(callback2) {
              setTimeout(function timeoutCallback() {
                self.getResult(
                  buildPlanKey,
                  buildResult.buildNumber,
                  function getResultCallback(err, data) {
                    result = data;
                    finished = data.finished;
                    callback2(err);
                  });
              }, 5000);
            },
            function buildCompletedCallback(err) {
              callback(err, result);
            });
        }
      ], cb);
    }
  };

  return exports;
};
