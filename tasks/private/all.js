"use strict";

/**
 * A module to add a gulp task which executes all build tasks.
 * @exports tasks/allTasks
 * @param {Gulp} gulp - The gulp module
 */
module.exports = function allTasks(gulp) {
  var runSequence = require("run-sequence");

  /**
   * A gulp build task to run all build tasks for a module.
   * The following tasks are executed in sequence:
   * ['code_analysis', 'test_cover', 'coverage_stats', 'license', 'docs', 'metadata', 'package']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all
   * @param {Function} cb - callback
   */
  gulp.task("all", function all(cb) {
    runSequence(
      "code_analysis",
      "step_sync",
      "test_cover",
      "coverage_stats",
      "docs",
      "metadata",
      cb);
  });

  /**
   * A gulp build task to run all build tasks for a product.
   * The following tasks are executed in sequence:
   * ['code_analysis', 'test_cover', 'coverage_stats', 'license', 'docs', 'metadata', 'webpack', 'package']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("all_product", function allProduct(cb) {
    runSequence(
      "code_analysis",
      "webpackTest",
      "test_cover",
      "coverage_stats",
      "metadata",
      "webpackPkg",
      "package",
      cb);
  });

  /**
   * A gulp build task to run all package tasks for a product.
   * The following tasks are executed in sequence:
   * ['coverage_stats', 'license', 'docs', 'metadata', 'webpack', 'package']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("package_product", function allProduct(cb) {
    runSequence(
      "coverage_stats",
      "metadata",
      "webpackPkg",
      "package",
      cb);
  });

  /**
   * A gulp build task to run all package tasks for a product api.
   * The following tasks are executed in sequence:
   * ['coverage_stats', 'license', 'docs', 'metadata', 'webpack', 'package']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("package_api", function allProduct(cb) {
    runSequence(
      "coverage_stats",
      "metadata",
      "package",
      cb);
  });

  /**
   * A gulp build task to run selenium and test tasks
   * The following tasks are executed in sequence:
   * [ 'webpack', 'test']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("selenium_test", function seleniumTest(cb) {
    runSequence(
      "start-selenium",
      "webpackCompileTemplatesTestMode",
      "test_cover_save_cov",
      "webpackCompileTemplates",
      "kill-selenium",
      cb);
  });


  /**
   * A gulp build task to run selenium, loopback and test tasks
   * The following tasks are executed in sequence:
   * [ 'webpack', 'test']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("selenium_loopback_test", function seleniumTest(cb) {
    runSequence(
      "start-loopback",
      "start-selenium",
      "webpackTest",
      "test_cover_save_cov",
      "webpackCompileTemplates",
      "kill-selenium",
      "kill-loopback",
      cb);
  });

  /**
   * A gulp build task to run webpack and test tasks
   * The following tasks are executed in sequence:
   * [ 'webpack', 'test']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("webpack_test", function allProduct(cb) {
    runSequence(
      "webpackTest",
      "test_cover_save_cov",
      "webpackCompileTemplates",
      cb);
  });

  /**
   * A gulp build task to run webpack and test_cover tasks
   * The following tasks are executed in sequence:
   * [ 'webpack', 'test']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("quick_test", function allProduct(cb) {
    runSequence(
      "webpackCompileTemplatesTestMode",
      "test_cover_save_cov",
      "webpackCompileTemplates",
      cb);
  });
};
