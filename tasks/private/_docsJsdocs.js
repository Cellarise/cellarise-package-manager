"use strict";

/**
 * A module to add gulp tasks which prepare code api readme documentation.
 * @exports tasks/docsJsdocsTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function docsJsdocsTasks(gulp, context) {
  var concat = require("gulp-concat");
  var path = require("path");
  var jsdoc2md = require("gulp-jsdoc-to-markdown");
  var GulpDustCompileRender = require("gulp-dust-compile-render");

  /**
   * A gulp build task to generate JSDoc documentation.
   * The result is saved to `doc/readme-api.md`.
   * @member {Gulp} docs_jsdocs
   * @return {through2} stream
   */
  gulp.task("docs_jsdocs", function docsJsdocsTask() {
    var cwd = context.cwd;
    var pkg = context.package;
    var directories = pkg.directories;
    var srcArr = [directories.lib + "/**/*.js", "app/index.js"];
    var options = {
      "separators": true,
      "template": "## API\n{{>main}}\n*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*.",
      "example-lang": "none",
      "heading-depth": 3,
      "name-format": "code",
      "preserveWhitespace": true,
      "partialsGlob": path.join(cwd, directories.doc) + "/examples/*.dust*"
    };
    if (directories.client) {
      srcArr.push(directories.client + "/source/**/*.js");
    }
    if (directories.server) {
      srcArr.push(directories.server + "/**/*.js");
    }
    if (directories.common) {
      srcArr.push(directories.common + "/**/*.js");
    }
    if (context.package.config.private) {
      srcArr.push(directories.tasks + "/**/*.js");
    }
    return gulp.src(srcArr, {"allowEmpty": true})
      .pipe(concat("readme-api.md"))
      .pipe(jsdoc2md(options))
      .pipe(new GulpDustCompileRender(pkg, options))
      .pipe(gulp.dest(directories.doc));
  });
};
