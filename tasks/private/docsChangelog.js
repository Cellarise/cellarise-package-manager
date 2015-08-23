"use strict";

/**
 * A module to add gulp tasks which prepare changelog readme documentation.
 * @exports tasks/docsChangelogTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function docsChangelogTasks(gulp, context) {
  var rename = require("gulp-rename");
  var path = require("path");
  var GulpDustCompileRender = require("gulp-dust-compile-render");
  var AsyncPipe = require("gulp-async-func-runner");
  var jiraUtils = require("../../lib/utils/jira")();

  /**
   * A gulp build task to compile and render the package changelog.
   * The changelog data is automatically sourced from Jira if the oauth config.json file exists and
   * package.json file contains property `config.projectCode`.
   * The result is saved to `doc/readme-changelog.md`.
   * @member {Gulp} docs_changelog
   * @return {through2} stream
   */
  gulp.task("docs_changelog", function docsChangelogTask() {
    //var cwd = context.cwd;
    var pkg = context.package;
    var directories = pkg.directories;

    return gulp.src(path.join(__dirname, "../templates") + "/readme-changelog.dust")
      .pipe(new AsyncPipe({
          "oneTimeRun": true,
          "passThrough": true
        },
        function getChangelog(opts, chunk, cb) {
          jiraUtils.getChangelog(pkg.config.projectCode, cb);
        },
        function getChangelogCallback(error, data) {
          if (!error) {
            pkg.changelog = data;
          }
        }))
      .pipe(new GulpDustCompileRender(pkg))
      .pipe(rename(function renameExtension(renamePath) {
          renamePath.extname = ".md";
      }))
      .pipe(gulp.dest(directories.doc));
  });
};
