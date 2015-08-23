"use strict";

/**
 * A module to add gulp tasks which automatically update one or more packages.
 * @exports tasks/autoScaffoldTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function autoScaffoldTasks(gulp, context) {
  var logger = context.logger;
  var utilsAutoUpdate = require("../../../lib/utils/autoUpdate")(logger);

  /**
   * A gulp build task to automatically update one or more packages.
   * @member {Gulp} auto_update_dependencies
   * @return {through2} stream
   */
  gulp.task("auto_scaffold", function autoScaffoldTask() {
    var opts = {
      "BUILD_DIR": "Auto_Build",
      "category": "Modules1",
      "include": ["GENPROD"],
      "exclude": ["MDBLDGEN"],
      "updateCheck": false,
      "updateCheckTask": "david_report",
      "updateSource": true,
      "updateSourceTask": "scaffold",
      "updateSourceSummary": "Package: Update eslint configuration, test.js runner and dev dependencies",
      "updateSourceType": "Non-functional",
      "bambooBuildTask": "all",
      "releaseVersion": false,
      "repositoryUrl": require("../../../lib/utils/config")("stash").repositoryUrl
    };
    return utilsAutoUpdate.run(opts, gulp, context);
  });
};
