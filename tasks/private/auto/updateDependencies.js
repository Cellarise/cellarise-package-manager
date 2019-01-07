"use strict";

/**
 * A module to add gulp tasks which automatically update package dependencies.
 * @exports tasks/updateDependenciesTasks
 * @param {Gulp} gulp - The gulp module
 */
module.exports = function updateDependenciesTasks(gulp) {

  /**
   * A gulp task to automatically update package dependencies.
   * The following tasks are executed in sequence: ["scaffold", "david-update", "david-cpm-update"]
   * The sequence works by piping each task to the next.
   * @member {Gulp} update_dependencies
   * @param {Function} cb - callback
   */
  gulp.task("update_dependencies", gulp.series(
    "scaffold",
    "david_update",
    "david_cpm_update"
  ));
};
