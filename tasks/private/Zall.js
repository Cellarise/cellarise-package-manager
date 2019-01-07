"use strict";

/**
 * A module to add a gulp task which executes all build tasks.
 * @exports tasks/allTasks
 * @param {Gulp} gulp - The gulp module
 */
module.exports = function allTasks(gulp) {

  /**
   * A gulp build task to run all build tasks for a module.
   * The following tasks are executed in sequence:
   * ['code_analysis', 'test_cover', 'coverage_stats', 'license', 'docs', 'metadata', 'package']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all
   * @param {Function} cb - callback
   */
  gulp.task("all", gulp.series(
    "code_analysis",
    "step_sync",
    "test_cover",
    "coverage_stats",
    "docs",
    "metadata"
  ));

  /**
   * A gulp build task to run all build tasks for a product.
   * The following tasks are executed in sequence:
   * ['code_analysis', 'test_cover', 'coverage_stats', 'license', 'docs', 'metadata', 'webpack', 'package']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("all_product", gulp.series(
    "code_analysis",
    "webpackTest",
    "test_cover",
    "coverage_stats",
    "metadata",
    "webpackPkg",
    "package"
  ));

  /**
   * A gulp build task to run all package tasks for a product.
   * The following tasks are executed in sequence:
   * ['coverage_stats', 'license', 'docs', 'metadata', 'webpack', 'package']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("package_product", gulp.series(
    "coverage_stats",
    "metadata",
    "webpackPkg",
    "package"
  ));
  gulp.task("package_product_local", gulp.series(
    "coverage_stats",
    "metadata",
    "webpackPkg"
  ));

  /**
   * A gulp build task to run all package tasks for a product api.
   * The following tasks are executed in sequence:
   * ['coverage_stats', 'license', 'docs', 'metadata', 'webpack', 'package']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("package_api", gulp.series(
    "coverage_stats",
    "metadata",
    "package"
  ));

  /**
   * A gulp build task to run selenium and test tasks
   * The following tasks are executed in sequence:
   * [ 'webpack', 'test']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("selenium_test", gulp.series(
    "start-selenium",
    "webpackCompileTemplatesTestMode",
    "test_cover_save_cov",
    "webpackCompileTemplates",
    "kill-selenium"
  ));


  /**
   * A gulp build task to run selenium, loopback and test tasks
   * The following tasks are executed in sequence:
   * [ 'webpack', 'test']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("selenium_loopback_test", gulp.series(
    "start-loopback",
    "start-selenium",
    "webpackTest",
    "test_cover_save_cov",
    "webpackCompileTemplates",
    "kill-selenium",
    "kill-loopback"
  ));

  /**
   * A gulp build task to run webpack and test tasks
   * The following tasks are executed in sequence:
   * [ 'webpack', 'test']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("webpack_test", gulp.series(
    "webpackTest",
    "test_cover_save_cov",
    "webpackCompileTemplates"
  ));

  /**
   * A gulp build task to run webpack and test_cover tasks
   * The following tasks are executed in sequence:
   * [ 'webpack', 'test']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all_product
   * @param {Function} cb - callback
   */
  gulp.task("quick_test", gulp.series(
    "webpackCompileTemplatesTestMode",
    "test_cover_save_cov",
    "webpackCompileTemplates"
  ));
};
