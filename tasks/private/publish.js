"use strict";

/**
 * A module to add a gulp task which executes publish tasks.
 * @exports tasks/publishTasks
 * @param {Gulp} gulp - The gulp module
 */
module.exports = function publishTasks(gulp) {
  var runSequence = require("run-sequence");

  /**
   * A gulp build task to run all build tasks for a module.
   * The following tasks are executed in sequence:
   * ['code_analysis', 'test_cover', 'coverage_stats', 'license', 'docs', 'metadata', 'package']
   * The sequence works by piping each task to the next.
   * @member {Gulp} all
   * @param {Function} cb - callback
   */
  gulp.task("publish", function publish(cb) {
    runSequence(
      "docs",
      "metadata",
      cb);
  });
};
