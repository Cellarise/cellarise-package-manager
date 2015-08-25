"use strict";

/**
 * A module to add gulp tasks which automatically update one or more packages.
 * @exports tasks/autoUpdateDependenciesTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function autoUpdateDependenciesTasks(gulp, context) {
  var logger = context.logger;
  var utilsAutoUpdate = require("../../../lib/utils/autoUpdate")(logger);

  /**
   * A gulp build task to automatically update one or more packages.
   * @member {Gulp} auto_update_dependencies
   * @return {through2} stream
   */
  gulp.task("auto_update_dependencies", function autoUpdateDependenciesTask() {
    var opts = {
      "BUILD_DIR": "Auto_Build",
      "category": "Modules",
      "include": [],
      "exclude": ["MDBLDGEN"],
      "updateCheck": true,
      "updateCheckTask": "david_report",
      "updateSource": true,
      "updateSourceTask": "update_dependencies",
      "updateSourceSummary": "Package: Update package dependencies",
      "updateSourceType": "Non-functional",
      "bambooBuildTask": "all",
      "releaseVersion": true,
      "repositoryUrl": require("../../../lib/utils/config")("github").repositoryUrl
    };
    return utilsAutoUpdate.run(opts, gulp, context);
  });
};
