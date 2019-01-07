"use strict";

/**
 * A module to add gulp tasks which prepare the package.json file for build packaging and deployment.
 * @exports tasks/metadataTasks
 * @param {Gulp} gulp - The gulp module
 */
module.exports = function metadataTasks(gulp) {
  var jeditor = require("gulp-json-editor");

  /**
   * A gulp build task to prepare the package.json file for build packaging and deployment.
   * Atlassian Bamboo variables are expected and used to populate the package.json version and config properties.
   * Also, all optionalDependencies are removed.
   * @member {Gulp} metadata
   * @return {through2} stream
   */
  gulp.task("metadata", function metadataTask() {
    var metaData = process.env;

    return gulp.src(["package.json"])
      .pipe(jeditor(function packageEditor(json) {
        //set attributes based on environment
        json.version = metaData.bamboo_jira_version &&
          metaData.bamboo_jira_version !== "DEV" ? metaData.bamboo_jira_version : "0.0.0";

        //delete or clear properties not to be published
        //json.optionalDependencies = {};
        if (!json.hasOwnProperty("config")) {
          json.config = {};
        }

        //set config
        json.config.build = metaData.bamboo_buildNumber ? metaData.bamboo_buildNumber : "n/a";
        json.config.buildTimestamp =
          metaData.bamboo_buildTimeStamp ? metaData.bamboo_buildTimeStamp : new global.Date().toISOString();

        return json;
      }))
      .pipe(gulp.dest("Build"))
      .pipe(gulp.dest("."));
  });
};
