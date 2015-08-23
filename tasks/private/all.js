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
      "step_sync",
      "webpackTest",
      "test_cover",
      "coverage_stats",
      "docs",
      "metadata",
      "webpackPkg",
      "package",
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
      "webpack",
      "test",
      cb);
  });
};
