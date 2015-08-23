"use strict";

/**
 * A module to add a gulp task which does nothing.
 * @exports tasks/nullTasks
 * @param {Gulp} gulp - The gulp module
 */
module.exports = function nullTasks(gulp) {
  /**
   * A gulp build task that does nothing. Used for tests.
   * @member {Gulp} null
   * @param {Function} cb - callback
   */
  gulp.task("null", function nullTask(cb) {
    cb();
  });
};
