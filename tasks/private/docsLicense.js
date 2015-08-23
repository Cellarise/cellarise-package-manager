"use strict";

/**
 * A module to add gulp tasks which prepare license readme documentation.
 * @exports tasks/docsLicenseTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function docsLicenseTasks(gulp, context) {
  var rename = require("gulp-rename");
  var path = require("path");
  var GulpDustCompileRender = require("gulp-dust-compile-render");
  var AsyncPipe = require("gulp-async-func-runner");
  var checker = require("npm-license");

  /**
   * A gulp build task to generate license documentation from all dependent packages.
   * The license data is automatically sourced from the node_modules folder using `npm-license`.
   * The result is saved to `doc/readme-license.md`.
   * @member {Gulp} docs_license
   * @return {through2} stream
   */
  gulp.task("docs_license", function docsLicenseTask() {
    var pkg = context.package;
    var directories = pkg.directories;

    return gulp.src(path.join(__dirname, "../templates") + "/readme-license.dust")
      .pipe(new AsyncPipe({
          "oneTimeRun": true,
          "passThrough": true
        },
        function licenseChecker(opts, chunk, cb) {
          checker.init({
            "unknown": false,// Boolean: generate only a list of unknown licenses
            "start": ".",    // String: path to start the dependency checks
            "depth": "1",    // Number | "all": how deep to recurse through the dependencies
            "include": "all" // String | Array | "all": recurse through various types of dependencies
          }, function licenseCheckerInterimCallback(dependencies) {
            cb(null, dependencies);
          });
        },
        function licenseCheckerCallback(error, data) {
          var dep, result;
          if (!error) {
            //process to get into format for dust
            pkg.licenses = [];
            for (dep in data) {
              if (data.hasOwnProperty(dep)) {
                result = {
                  "name": dep,
                  "license": JSON.stringify(data[dep].licenses),
                  "repository": JSON.stringify(data[dep].repository)
                };
                pkg.licenses.push(result);
              }
            }
          }
        }))
      .pipe(new GulpDustCompileRender(pkg))
      .pipe(rename(function renameExtension(renamePath) {
          renamePath.extname = ".md";
      }))
      .pipe(gulp.dest(directories.doc));
  });
};
