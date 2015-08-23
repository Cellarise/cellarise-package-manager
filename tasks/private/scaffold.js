"use strict";

/**
 * A module to add gulp tasks which currently update development dependencies but in future could provide further
 * scaffolding.
 * @exports tasks/scaffoldTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function scaffoldTasks(gulp, context) {
  var logger = context.logger;
  var pkg = context.package;
  var cwd = context.cwd;
  var _ = require("underscore");
  var mkdirp = require("mkdirp");
  var path = require("path");
  var execUtils = require("../../bin/exec")(logger);
  var vasync = require("vasync");
  var scaffold = function scaffold(scaffoldPath){
    var source = [
      path.join(__dirname, "../..") + "/.editorconfig",
      path.join(__dirname, "../..") + "/.eslintignore",
      path.join(__dirname, "../..") + "/.eslintrc",
      path.join(__dirname, "../..") + "/.gitignore",
      path.join(__dirname, "../..") + "/.npmignore",
      path.join(__dirname, "../..") + "/.travis.yml",
      path.join(__dirname, "../..") + "/gulpfile.js",
      path.join(__dirname, "../..") + "/Test/.eslintrc",
      path.join(__dirname, "../..") + "/Test/test.js",
      path.join(__dirname, "../..") + "/Test/testUtils.js",
      path.join(__dirname, "../..") + "/tasks/**/*",
      "!" + path.join(__dirname, "../..") + "/tasks/private/**/*",
      "!" + path.join(__dirname, "../..") + "/tasks/templates/**/*",
      "!" + path.join(__dirname, "../..") + "/tasks/private",
      "!" + path.join(__dirname, "../..") + "/tasks/templates"
    ];
    source = _.map(source, function normaliseSlashes(dir) {
      return dir.replace(/\\/g, "/");
    });
    return gulp.src(source, {"base": path.join(__dirname, "../..") + "/", "dot": true, "nonegate": false})
      .pipe(gulp.dest(scaffoldPath)); //loads files to the standard directory
  };

  /**
   * A gulp build task to scaffold an existing package.
   * @member {Gulp} scaffold
   * @param {Function} done - callback
   * @return {through2} stream
   */
  gulp.task("scaffold", function scaffoldPackageJSONTask() {
    var cpmPkg = require(path.join(__dirname, "../..", "package.json"));
    if (pkg.name === cpmPkg.name) {
      return {};
    }
    return scaffold(cwd);
  });

  /**
   * A gulp build task to rebuild the source scaffold files for yeoman generators by copying default files from this
   * package.
   * @member {Gulp} rebuild_scaffold
   * @param {Function} done - callback
   */
  gulp.task("rebuild_scaffold", function rebuildScaffoldTask(done) {
    var yeomanGeneratorPath = path.join(cwd, "app/templates/standard");
    if (pkg.name.indexOf("generator") === 0){
      //check if generator
      vasync.pipeline({
          "funcs": [
            function clearStandardTasksFolder(err, callback) {
              if (err) {
                logger.error(err);
              }
              execUtils.clearFolder(path.join(yeomanGeneratorPath, "tasks"), callback);
            },
            function createTasksFolders(err, callback) {
              if (err) {
                logger.error(err);
              }
              mkdirp.sync(path.join(yeomanGeneratorPath, "tasks"));
              callback();
            },
            function saveStandardFiles(err, callback) {
              if (err) {
                logger.error(err);
              }
              scaffold(yeomanGeneratorPath);
              callback();
            }
          ]
        },
        done);
    } else {
      logger.error("rebuild_scaffold task only applicable to yeoman generators");
      done();
    }
  });

};
