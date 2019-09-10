"use strict";

/**
 * A module to add gulp tasks for the webpack module bundler.
 * @exports tasks/webpackTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function webpackTasks(gulp, context) {
  var path = require("path");
  var webpack = require('webpack');
  var gulpWebpack = require('webpack-stream');
  var GulpDustCompileRender = require("gulp-dust-compile-render");
  var rename = require("gulp-rename");
  var fs = require("fs");
  var R = require('ramda');

  /**
   *
   * @param {String} configPath - path to webpack config
   * @param {Object} webpackOptions - other options to merge with Webpack config to pass to Gulp Webpack
   * @return {through2} stream
   */
  var webpackRunner = function webpackRunner(configPath, webpackOptions) {
    var NODE_MODULES_DIR = path.resolve(path.join(__dirname, "../../node_modules"));
    var logger = context.logger;
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = pkg.directories;
    var webpackConfig = require(path.join(cwd, directories.client + configPath));
    //var entry = directories.client + "/source/entry.js";
    var dest;
    if (R.isNil(R.path(["output", "path"], webpackConfig))) {
      logger.error("Was expecting an output path in the Webpack config");
    } else {
      dest = webpackConfig.output.path;
    }
    //direct modules to this package node_modules
    webpackConfig.resolveLoader = {"modules": [NODE_MODULES_DIR]};
    webpackConfig = R.merge(webpackConfig, webpackOptions || {});
    return gulp
      .src(directories.client)
      .pipe(gulpWebpack(webpackConfig, webpack /*,
       function gulpWebpackStats(err, stats){
       Use stats to do more things if needed
       })*/))
      .pipe(gulp.dest(dest));
  };
  var webpackCompileTemplatesTaskGeneric = function webpackCompileTemplatesTaskGeneric(testMode) {
    //read Build/package.json is exists (i.e. created by metadata) or read /package.json
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = pkg.directories;
    var templatePkg;
    var buildPackagePath = path.join(cwd, directories.build + "/package.json");
    var localPackagePath = path.join(cwd, "package.json");

    var buildNumber = process.env.bamboo_buildNumber ? process.env.bamboo_buildNumber : 0;
    //set version based on environment (targeting build server)
    var version = process.env.bamboo_jira_version && process.env.bamboo_jira_version !== "DEV"
      ? process.env.bamboo_jira_version
      : "0.0.0";

    if (fs.existsSync(buildPackagePath)) {
      templatePkg = require(buildPackagePath);
    } else {
      templatePkg = require(localPackagePath);
    }
    templatePkg.originalVersion = version.replace(/\./g, '-');
    templatePkg.friendlyVersion = templatePkg.originalVersion + "_" + buildNumber;
    return gulp
      .src(directories.client + "/boot.dust")
      .pipe(new GulpDustCompileRender(R.assoc("testMode", testMode + "", templatePkg), {"helper": "dustjs-helpers"}))
      .pipe(rename(function renameExtension(renamePath) {
        renamePath.extname = "-" + templatePkg.friendlyVersion + ".js";
      }))
      .pipe(gulp.dest(directories.client + "/public"));
  };


  /**
   * A gulp build task to compile dust templates in directories.client.
   * The dust templates will be provided one of the following package.json as context:
   *  Build/package.json
   *  package.json
   * @member {Gulp} webpackCompileTemplates
   * @return {through2} stream
   */
  gulp.task("webpackCompileTemplates", gulp.series(
    "webpackCompileIndex", "webpackCompileConfig", "webpackCompileRoutes",
    function post() {
      return webpackCompileTemplatesTaskGeneric(false);
    }
  ));

  /**
   * A gulp build task to compile dust templates in directories.client with test flag set to true.
   * The dust templates will be provided one of the following package.json as context:
   *  Build/package.json
   *  package.json
   * @member {Gulp} webpackCompileTemplatesTestMode
   * @return {through2} stream
   */
  gulp.task("webpackCompileTemplatesTestMode", gulp.series(
    "webpackCompileIndexTestMode", "webpackCompileConfig", "webpackCompileRoutes",
    function webpackCompileTemplatesTestModeTask() {
      return webpackCompileTemplatesTaskGeneric(true);
    }
  ));
  /**
   * A gulp build task to run the webpack module bundler for development.
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpack", gulp.series(
    "webpackCompileTemplates",
    function webpackTask() {
      return webpackRunner("/config/webpack.config.dev.js");
    }
  ));
  /**
   * A gulp build task to continuously run the webpack module bundler for development in watch mode.
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpackWatch", gulp.series(
    "webpackCompileTemplates",
    function webpackTask() {
      return webpackRunner("/config/webpack.config.dev.js", {"watch": true});
    }
  ));
  /**
   * A gulp build task to run the webpack module bundler using the test config.
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpackTest", gulp.series(
    "webpackCompileTemplatesTestMode",
    function webpackTask() {
      return webpackRunner("/config/webpack.config.test.js");
    }
  ));
  /**
   * A gulp build task to run metadata and the webpack module bundler using the test config.
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpackTestAndMeta", gulp.series(
    "metadata", "webpackCompileTemplatesTestMode",
    function webpackTask() {
      return webpackRunner("/config/webpack.config.test.js");
    }
  ));
  /**
   * A gulp build task to run the webpack module bundler for production packaging.
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpackPkg", gulp.series(
    "webpackCompileTemplates",
    function webpackTask() {
      return webpackRunner("/config/webpack.config.package.js");
    }
  ));
};
