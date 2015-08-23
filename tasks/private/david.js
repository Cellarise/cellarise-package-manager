"use strict";

/**
 * A module to add gulp tasks which check/report/update package dependencies.
 * @exports tasks/davidTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function davidTasks(gulp, context) {
  var directories = context.package.directories;
  var cwd = context.cwd;
  var pkg = context.package;
  var logger = context.logger;
  var davidUtils = require("../../lib/utils/david")(logger);
  var execUtils = require("../../bin/exec")(logger);
  var vasync = require("vasync");
  var path = require("path");

  /**
   * A gulp build task to generate a package dependency report for production dependencies only
   * and output to the package reports directory.
   * @member {Gulp} david_report
   * @param {Function} cb - callback
   */
  gulp.task("david_report", function davidReportTask(cb) {
    vasync.parallel({
      "funcs": [
        function outputCucumberReport(callback) {
          var optsCucumber = {
            "reportPath": path.join(cwd, directories.reports, "cucumber-tests.json"),
            "stable": false,
            "reportType": "cucumber"
          };
          davidUtils.dependencyReport(pkg, optsCucumber, callback);
        },
        function outputMochaReport(callback) {
          var optsMocha = {
            "reportPath": path.join(cwd, directories.reports, "david-mocha-tests.json"),
            "stable": false,
            "reportType": "mocha"
          };
          davidUtils.dependencyReport(pkg, optsMocha, callback);
        }
      ]
    }, function davidReportParallelCallback(err) {
      cb(err);
    });
  });

  /**
   * A gulp build task to generate a package dependency report and output to the package reports directory.
   * @member {Gulp} david_report_all
   * @param {Function} cb - callback
   */
  gulp.task("david_report_all", function davidReportAllTask(cb) {
    vasync.parallel({
      "funcs": [
        function outputCucumberReport(callback) {
          var optsCucumber = {
            "reportPath": path.join(cwd, directories.reports, "cucumber-tests.json"),
            "stable": false,
            "reportType": "cucumber",
            "dev": true,
            "optional": true
          };
          davidUtils.dependencyReport(pkg, optsCucumber, callback);
        },
        function outputMochaReport(callback) {
          var optsMocha = {
            "reportPath": path.join(cwd, directories.reports, "david-mocha-tests.json"),
            "stable": false,
            "reportType": "mocha",
            "dev": true,
            "optional": true
          };
          davidUtils.dependencyReport(pkg, optsMocha, callback);
        }
      ]
    }, function davidReportAllParallelCallback(err) {
      cb(err);
    });
  });

  /**
   * A gulp build task to update package.json dependencies and optional dependencies with the most recent stable
   * versions.
   * @member {Gulp} david_update
   * @param {Function} cb - callback
   */
  gulp.task("david_update", function davidUpdateTask(cb) {
    var pathToManifest = path.join(cwd, "package.json");
    vasync.pipeline({
      "funcs": [
        function addUpdatedProductionDeps(arg, callback) {
          davidUtils.addUpdatedDeps(pathToManifest, {}, callback);
        },
        function addUpdatedOptionalDeps(arg, callback) {
          davidUtils.addUpdatedDeps(pathToManifest, {"optional": true}, callback);
        }
      ]
    }, function davidUpdatePipelineCallback(err) {
      cb(err);
    });
  });

  /**
   * A gulp build task to update package.json dependencies with the most recent stable versions.
   * @member {Gulp} david_update_all
   * @param {Function} cb - callback
   */
  gulp.task("david_update_all", function davidUpdateTask(cb) {
    var pathToManifest = path.join(cwd, "package.json");
    vasync.pipeline({
      "funcs": [
        function addUpdatedProductionDeps(arg, callback) {
          davidUtils.addUpdatedDeps(pathToManifest, {}, callback);
        },
        function addUpdatedDevelopmentDeps(arg, callback) {
          davidUtils.addUpdatedDeps(pathToManifest, {"dev": true}, callback);
        },
        function addUpdatedOptionalDeps(arg, callback) {
          davidUtils.addUpdatedDeps(pathToManifest, {"optional": true}, callback);
        }
      ]
    }, function davidUpdatePipelineCallback(err) {
      cb(err);
    });
  });

  /**
   * A gulp build task to run cpm update to update the package NPM dependencies to the most recent stable versions.
   * @member {Gulp} david_cpm_update
   * @param {Function} cb - callback
   */
  gulp.task("david_cpm_update", function davidCPMUpdateTask(cb) {
    execUtils.runCPM("update", null, function runCPMCallback(err, stdout) {
      logger.info(stdout);
      cb(err);
    });
  });
};
