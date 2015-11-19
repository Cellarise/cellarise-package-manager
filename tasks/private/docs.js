"use strict";

/**
 * A module to add gulp tasks which prepare readme documentation.
 * @exports tasks/docsTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function docsTasks(gulp, context) {
  var rename = require("gulp-rename");
  var path = require("path");
  var GulpDustCompileRender = require("gulp-dust-compile-render");

  /**
   * A gulp build task to compile and render the `tasks/templates/readme.dust` document template.
   * The document template readme.dust references four other templates:
   * 1) readme-api.md (this file is produced by the `docs_jsdocs` gulp task)
   * 2) readme-license.md (this file is produced by the `docs_license` gulp task)
   * 3) readme-usage.md (this file is updated manually with installation and usage information)
   * 4) readme-changelog.md (this file is produced by the `docs_changelog` gulp task)
   * The result is saved to `README.md`.
   * @member {Gulp} docs
   * @return {through2} stream
   */
  gulp.task("docs", ["docs_license", "docs_changelog", "docs_jsdocs"], function docsTask() {
    var cwd = context.cwd;
    var pkg = context.package;
    var directories = pkg.directories;
    var options = {
      "partialsGlob": path.join(cwd, directories.doc) + "/**/*.*"
    };

    return gulp.src(path.join(__dirname, "../templates") + "/readme.dust")
      .pipe(new GulpDustCompileRender(pkg, options))
      .pipe(rename(function renameFile(renamePath) {
          renamePath.basename = "README";
          renamePath.extname = ".md";
      }))
      .pipe(gulp.dest(""));
  });


  /**
   * A gulp build task to compile and render the `tasks/templates/readme-product.dust` document template.
   * The document template readme.dust references four other templates:
   * 1) readme-api.md (this file is produced by the `docs_jsdocs` gulp task)
   * 2) readme-license.md (this file is produced by the `docs_license` gulp task)
   * 3) readme-usage.md (this file is updated manually with installation and usage information)
   * 4) readme-changelog.md (this file is produced by the `docs_changelog` gulp task)
   * The result is saved to `README.md`.
   * @member {Gulp} docs
   * @return {through2} stream
   */
  gulp.task("docs_product", ["docs_licenseP", "docs_changelogMD"], function docsTask() {
    var cwd = context.cwd;
    var pkg = context.package;
    var directories = pkg.directories;
    var options = {
      "partialsGlob": path.join(cwd, directories.doc) + "/**/*readme-*.*"
    };

    return gulp.src(path.join(__dirname, "../templates") + "/readme-product.dust")
      .pipe(new GulpDustCompileRender(pkg, options))
      .pipe(rename(function renameFile(renamePath) {
        renamePath.basename = "README";
        renamePath.extname = ".md";
      }))
      .pipe(gulp.dest(""));
  });
};
