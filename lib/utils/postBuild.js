"use strict";

/**
 * Post build utilities
 * @exports utils/postBuild
 * @param {bunyan} logger - A logger matching the bunyan API
 * @returns {Object} Post build utility functions
 */
module.exports = function postBuildUtils(logger) {
  var vasync = require("vasync");
  var path = require("path");
  var fs = require("fs");
  var results = [];

  var exports = {
    /**
     * Check whether a file or directory path exists and if not record an error message in the provided results object.
     * @param {String} testPath - the path to test from the current working directory
     * @param {String} cwd - the current working directory
     * @param {Object} result - the result object to record an error message if file or directory path does not exist
     * @returns {Boolean} true if the file or directory path exists
     */
    "pathExists": function pathExists(testPath, cwd, result) {
      var message = "Build directory/file " + testPath + " does not exist. ";
      if (!fs.existsSync(path.join(cwd, "Build", testPath))) {
        logger.error(message);
        result.errorMessages.push(message);
        return false;
      }
      return true;
    },
    /**
     * Check whether a file or directory path exists and if so record an error message in the provided results object.
     * @param {String} testPath - the path to test from the current working directory
     * @param {String} cwd - the current working directory
     * @param {Object} result - the result object to record an error message if file or directory path exists
     * @returns {Boolean} true if the file or directory path does not exist
     */
    "pathNotExists": function pathNotExists(testPath, cwd, result) {
      var message = "Build directory/file " + testPath + " exists. ";
      if (fs.existsSync(path.join(cwd, "Build", testPath))) {
        logger.error(message);
        result.errorMessages.push(message);
        return false;
      }
      return true;
    },
    /**
     * Post build checks including:
     * Check that build directory exists and contains expected contents
     * @param {Object} directories - the directories listed in package.json
     * @param {String} cwd - the current working directory
     * @param {Function} cb - callback
     */
    "checks": function checks(directories, cwd, cb){
      var self = this;
      vasync.parallel({
        "funcs": [
          function checkBuildDirectory(callback) {
            var result = {
              "testName": "Check that build directory exists and contains expected contents",
              "errorMessages": []
            };
            if (self.pathExists("", cwd, result)){
              self.pathNotExists(directories.reports, cwd, result);
              self.pathExists(".gitignore", cwd, result);
              self.pathExists(".eslintrc", cwd, result);
              self.pathExists(".eslintignore", cwd, result);
              self.pathExists(".npmignore", cwd, result);
            }
            results.push(result);
            callback();
          },
          function checkPackageJSON(callback) {
            var buildPackageJSON;
            var result = {
              "testName": "Check build package.json exists and contains expected properties",
              "errorMessages": []
            };
            if (self.pathExists("package.json", cwd, result)){
              buildPackageJSON = require(path.join(cwd, "Build/package.json"));
              if (buildPackageJSON.config.build === "n/a"){
                result.errorMessages.push("Build number not set. ");
              }
            }
            results.push(result);
            callback();
          }
        ]
      }, function postBuildParallelCallback(err) {
        require("../reports/postBuildMocha")(
          "Post build",
          results,
          path.join(cwd, directories.reports, "postBuild-mocha-tests.json"));
        require("../reports/postBuildCucumber")(
          "Post build",
          results,
          path.join(cwd, directories.reports, "cucumber-tests.json"));
        cb(err);
      });
    }
  };

  return exports;
};
