"use strict";

/**
 * A module to add gulp tasks which runs post build verification tests
 * @exports tasks/postBuild
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function postBuildTasks(gulp, context) {
  var directories = context.package.directories;
  var cwd = context.cwd;
  var logger = context.logger;
  var postBuildUtils = require("../../lib/utils/postBuild")(logger);
  /**
   * A gulp build task to run post build verification tests.
   * @param {Function} cb - callback
   */
  gulp.task("post_build", function postBuildTask(cb) {
    postBuildUtils.checks(directories, cwd, cb);
  });
};
