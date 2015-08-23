"use strict";

/**
 * A module to add a gulp tasks which creates missing test steps in new or existing step libraries.
 * @exports tasks/stepsTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {Bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function stepsTasks(gulp, context) {
  var path = require("path");
  var Both = require("gulp-yadda-steps");

  /**
   * A gulp build task to create missing test steps in new or existing step libraries.
   * @member {Gulp} steps
   * @param {Function} cb - callback
   */
  gulp.task("steps", function stepsTask(cb) {
    var cwd = context.cwd;
    var pkg = context.package;
    var directories = pkg.directories;
    gulp.src([directories.test + "/**/*.feature"])
      .pipe(new Both({
        "libraryBasePath": path.join(cwd, directories.testLibrary ? directories.testLibrary : directories.test),
        "featureBasePath": path.join(cwd, directories.test)
      }))
      .pipe(gulp.dest(directories.test))
      .on("end", cb);
  });
};
