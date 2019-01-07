"use strict";

/**
 * A module to add a default gulp task which executes default build tasks.
 * @exports tasks/defaultTasks
 * @param {Gulp} gulp - The gulp module
 */
module.exports = function defaultTasks(gulp) {

  /**
   * The default private gulp build task to execute all tasks. The following tasks are executed in sequence:
   * ["code_analysis", "step_sync", "test_cover", "coverage_stats", "license", "docs", "metadata", "package"]
   * This default task if present will override the default gulp task.
   * The sequence works by piping each task to the next.
   * @member {Gulp} default
   * @param {Function} cb - callback
   */
  gulp.task("default", gulp.series(
    "code_analysis",
    "step_sync",
    "test_cover",
    "coverage_stats",
    "docs",
    "metadata"
  ));
};
