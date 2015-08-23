"use strict";

/**
 * David build utilities
 * @exports utils/david
 * @param {bunyan} logger - A logger matching the bunyan API
 * @returns {Object} David build utility functions
 */
module.exports = function davidUtils(logger) {
  var david = require("david");
  var fs = require("fs");
  var vasync = require("vasync");
  var _ = require("underscore");

  var exports = {

    /**
     * Generate a dependency report in the mocha output format.
     * @param {Object} manifest - Parsed package.json file contents
     * @param {Object} [opts] Options
     * @param {Object} [opts.reportType="mocha"] - The report output format.  Choose from mocha or cucumber.
     * @param {Object} [opts.reportPath] - The output path for the report
     * @param {Boolean} [opts.stable=false] - Consider only stable packages
     * @param {Function} cb Function that receives the results
     */
    "dependencyReport": function dependencyReport(manifest, opts, cb) {
      var self = this;
      var checks = [];
      var reportWriter;
      var report;
      opts = _.defaults(opts, {
        "stable": false,
        "reportType": "mocha",
        "dev": false,
        "optional": false
      });
      //capitalise first character of reportType for require()
      opts.reportType = opts.reportType.charAt(0).toUpperCase() + opts.reportType.slice(1);
      reportWriter = require("../reports/david" + opts.reportType)();
      report = reportWriter.prepare();

      //add dependency checks
      checks.push(
        function production(arg, callback) {
          logger.info("Checking production dependencies");
          opts.suite = "Production dependencies";
          opts.dev = false;
          opts.optional = false;
          self.recordDependencies(manifest, opts, report, reportWriter, callback);
        });
      if (opts.dev) {
        checks.push(
          function dependencies(arg, callback) {
            logger.info("Checking development dependencies");
            opts.suite = "Development dependencies";
            opts.dev = true;
            opts.optional = false;
            self.recordDependencies(manifest, opts, report, reportWriter, callback);
          });
      }
      if (opts.optional) {
        checks.push(
          function optionalDependencies(arg, callback) {
            logger.info("Checking optional dependencies");
            opts.suite = "Optional dependencies";
            opts.dev = false;
            opts.optional = true;
            self.recordDependencies(manifest, opts, report, reportWriter, callback);
          });
      }

      vasync.pipeline({"funcs": checks}, function dependencyCheckCallback(err) {
        if (!err) {
          reportWriter.writeToFileSync(opts.reportPath, report);
        }
        cb(err);
      });
    },

    /**
     * Record the result of dependency checks against all provided dependencies of a particular type
     * in the report object. The david.isUpdated() function.
     * @param {Object} manifest Parsed package.json file contents
     * @param {Object} [opts] Options
     * @param {String} [opts.suite]  - the dependency type string description
     * @param {Boolean} [opts.stable] Consider only stable packages
     * @param {Boolean} [opts.dev] Consider devDependencies
     * @param {Boolean} [opts.optional] Consider optionalDependencies
     * @param {Boolean} [opts.peer] Consider peerDependencies
     * @param {Boolean} [opts.loose] Use loose option when querying semver
     * @param {Object} [opts.npm] npm configuration options
     * @param {Boolean} [opts.warn.E404] Collect 404s but don't abort
     * @param {Object} rpt - report object to record results to
     * @param {Object} reportWriter Provides write method to write the result of each package dependency
     * check to the rpt object
     * @param {Function} cb Function that receives the results
     */
    "recordDependencies": function recordDependencies(manifest, opts, rpt, reportWriter, cb) {
      david.getDependencies(manifest, opts, function getDependenciesCallback(err, pkgs) {
        Object.keys(pkgs).forEach(function eachPackage(pkg) {
          reportWriter.write(opts, pkgs, pkg, rpt);
        });
        cb(err, rpt);
      });
    },

    /**
     * Add updated dependencies to package.json
     * @param {Object} pathToManifest path to the package.json file
     * @param {Object} [opts] Options
     * @param {Boolean} [opts.stable] Consider only stable packages
     * @param {Boolean} [opts.dev] Provided dependencies are dev dependencies
     * @param {Boolean} [opts.optional] Provided dependencies are optional dependencies
     * @param {Boolean} [opts.peer] Consider peerDependencies
     * @param {Boolean} [opts.loose] Use loose option when querying semver
     * @param {Object} [opts.npm] npm configuration options
     * @param {Boolean} [opts.warn.E404] Collect 404s but don"t abort
     * @param {Function} cb Callback
     */
    "addUpdatedDeps": function addUpdatedDeps(pathToManifest, opts, cb) {
      var manifest = JSON.parse(fs.readFileSync(pathToManifest));
      var type = "dependencies";
      if (opts.dev) {
        type = "devDependencies";
      } else if (opts.optional) {
        type = "optionalDependencies";
      }
      david.getUpdatedDependencies(manifest, opts, function getUpdatedDependenciesCallback(er, pkgs) {
        manifest[type] = manifest[type] || {};
        Object.keys(pkgs).forEach(function eachPackage(pkg) {
          if (pkgs[pkg].required !== "^" + pkgs[pkg].stable) {
            manifest[type][pkg] = "^" + pkgs[pkg].stable;
            logger.info("Updated: " + pkg + " to " + pkgs[pkg].stable);
          }
        });
        fs.writeFileSync(pathToManifest, JSON.stringify(manifest, null, 2));
        cb();
      });
    }
  };

  return exports;
};
