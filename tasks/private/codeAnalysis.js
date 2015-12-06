"use strict";

/**
 * A module to add gulp tasks which execute static code analysis.
 * @exports tasks/codeAnalysisTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function codeAnalysisTasks(gulp, context) {
  var eslint = require("gulp-eslint");

  /**
   * A gulp build task to execute static code analysis on the files at `package.json:directories.lib`.
   * The report results are saved to `package.json:directories.reports`
   * @member {Gulp} code_analysis
   * @return {through2} stream
   */
  gulp.task("code_analysis", function codeAnalysisTask() {
    var cwd = context.cwd;
    var pkg = context.package;
    var directories = pkg.directories;
    var reportPath = cwd + "/" + pkg.directories.reports;
    var fs = require("fs");
    var mkdirp = require("mkdirp");
    var eslintMochaOut, eslintCucumberOut;
    var srcArr = [directories.lib + "/**/*.js", directories.tasks + "/**/*.js", directories.test + "/**/*.js"];
    if (directories.client) {
      srcArr.push(directories.client + "/source/**/*.js");
      srcArr.push(directories.client + "/source/**/*.jsx");
    }
    if (directories.server) {
      srcArr.push(directories.server + "/**/*.js");
    }
    if (directories.common) {
      srcArr.push(directories.common + "/**/*.js");
    }
    mkdirp.sync(reportPath);
    eslintMochaOut = fs.createWriteStream(reportPath + "/lint-mocha-tests.json");
    eslintCucumberOut = fs.createWriteStream(reportPath + "/cucumber-tests.json");
    return gulp.src(srcArr)
      .pipe(eslint())
      .pipe(eslint.format(require("../../lib/reports/eslintBunyan")))
      .pipe(eslint.format(require("../../lib/reports/eslintMocha"), eslintMochaOut))
      .pipe(eslint.format(require("../../lib/reports/eslintCucumber"), eslintCucumberOut));
  });


  /**
   * A gulp build task to kill Loopback in test mode
   * @alias tasks:killLoopback
   */
  gulp.task('wait',  function waitTask(cb) {
    setTimeout(cb, 5000);
  });
};
