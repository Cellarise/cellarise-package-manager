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
  var gulpWebpack = require('gulp-webpack');
  var GulpDustCompileRender = require("gulp-dust-compile-render");
  var rename = require("gulp-rename");
  var batch = require("gulp-batch");
  var watch = require("gulp-watch");
  var fs = require("fs");
  var R = require('ramda');

  var webpackRunner = function webpackRunner(configPath) {
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = pkg.directories;
    var webpackConfig = require(path.join(cwd, directories.client + configPath));
    //var entry = directories.client + "/source/entry.js";
    var dest = directories.client + "/public";
    //direct modules to this package node_modules
    webpackConfig.resolveLoader = {"modulesDirectories": [path.join(__dirname, "../../node_modules")]};
    return gulp.src("")
      .pipe(gulpWebpack(webpackConfig, webpack /*,
       function gulpWebpackStats(err, stats){
       Use stats to do more things if needed
       })*/))
      .pipe(gulp.dest(dest));
  };
  var webpackCompileIndexTaskGeneric = function webpackCompileIndexTaskGeneric() {
    //read Build/package.json is exists (i.e. created by metadata) or read /package.json
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = pkg.directories;
    var templatePkg;
    var buildPackagePath = path.join(cwd, directories.build + "/package.json");
    var localPackagePath = path.join(cwd, "package.json");

    //set version based on environment (targeting build server)
    var version = process.env.bamboo_jira_version && process.env.bamboo_jira_version !== "DEV"
      ? process.env.bamboo_jira_version
      : "0.0.0";

    if (fs.existsSync(buildPackagePath)) {
      templatePkg = require(buildPackagePath);
    } else {
      templatePkg = require(localPackagePath);
    }
    templatePkg.friendlyVersion = version.replace(/\./g, '-');
    return gulp.src(directories.client + "/index.dust")
      .pipe(new GulpDustCompileRender(templatePkg, {"helper": "dustjs-helpers"}))
      .pipe(rename(function renameExtension(renamePath) {
        renamePath.extname = ".html";
      }))
      .pipe(gulp.dest(directories.client));
  };
  var webpackCompileTemplatesTaskGeneric = function webpackCompileTemplatesTaskGeneric(testMode) {
    //read Build/package.json is exists (i.e. created by metadata) or read /package.json
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = pkg.directories;
    var templatePkg;
    var buildPackagePath = path.join(cwd, directories.build + "/package.json");
    var localPackagePath = path.join(cwd, "package.json");

    //set version based on environment (targeting build server)
    var version = process.env.bamboo_jira_version && process.env.bamboo_jira_version !== "DEV"
      ? process.env.bamboo_jira_version
      : "0.0.0";

    if (fs.existsSync(buildPackagePath)) {
      templatePkg = require(buildPackagePath);
    } else {
      templatePkg = require(localPackagePath);
    }
    templatePkg.friendlyVersion = version.replace(/\./g, '-');
    return gulp.src(directories.client + "/boot.dust")
      .pipe(new GulpDustCompileRender(R.assoc("testMode", testMode, templatePkg), {"helper": "dustjs-helpers"}))
      .pipe(rename(function renameExtension(renamePath) {
        renamePath.extname = "-" + templatePkg.friendlyVersion + ".js";
      }))
      .pipe(gulp.dest(directories.client + "/public"));
  };
  var webpackCompileConfiguration = function webpackCompileConfiguration() {
    var jeditor = require("gulp-json-editor");
    //read Build/package.json is exists (i.e. created by metadata) or read /package.json
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = pkg.directories;
    var configCompilerPath = path.join(cwd, directories.client + "/source/scripts/config/configCompiler.js");
    var configPath = path.join(cwd, directories.client + "/source/scripts/config/config.json");
    var config1Path = path.join(cwd, directories.client + "/source/scripts/config");


    fs.writeFileSync(configPath, JSON.stringify({}), 'utf8');

    return gulp.src(configPath)
      .pipe(jeditor(function compileConfig() {
        var compiledConfig =  require(configCompilerPath);
        return compiledConfig;
      }))
      .pipe(gulp.dest(config1Path));
  };
  /**
   * A gulp build task to run the webpack module bundler for development.
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpack", ["webpackCompileTemplates"], function webpackTask() {
    return webpackRunner("/config/webpack.config.dev.js");
  });
  gulp.task("webpackWatch", ["webpackCompileTemplates"], function webpackTask() {
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = pkg.directories;
    var clientDir = path.join(cwd, directories.client);
    var webpackRunnerDev = function() {
      webpackRunner("/config/webpack.config.dev.js");
    };
    webpackRunnerDev();
    return watch(clientDir + "/**/*", batch(function(events, done) {
      webpackRunnerDev().on("end", done);
    }));
  });
  /**
   * A gulp build task to run the webpack module bundler using the test config.
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpackTest", ["webpackCompileTemplatesTestMode"], function webpackTask() {
    return webpackRunner("/config/webpack.config.test.js");
  });
  /**
   * A gulp build task to run the webpack module bundler for production packaging.
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpackPkg", ["webpackCompileTemplates"], function webpackTask() {
    return webpackRunner("/config/webpack.config.package.js");
  });
  /**
   * A gulp build task to compile dust templates in directories.client.
   * The dust templates will be provided one of the following package.json as context:
   *  Build/package.json
   *  package.json
   * @member {Gulp} webpackCompileTemplates
   * @return {through2} stream
   */
  gulp.task("webpackCompileTemplates", ["webpackCompileIndex", "webpackCompileConfig"],
    function webpackCompileTemplatesTask() {
    return webpackCompileTemplatesTaskGeneric(false);
  });
  /**
   * A gulp build task to compile dust templates in directories.client with test flag set to true.
   * The dust templates will be provided one of the following package.json as context:
   *  Build/package.json
   *  package.json
   * @member {Gulp} webpackCompileTemplatesTestMode
   * @return {through2} stream
   */
  gulp.task("webpackCompileTemplatesTestMode", ["webpackCompileIndex", "webpackCompileConfig"],
    function webpackCompileTemplatesTestModeTask() {
    return webpackCompileTemplatesTaskGeneric(true);
  });
  /**
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpackCompileIndex", function webpackCompileIndexTask() {
    return webpackCompileIndexTaskGeneric();
  });
  /**
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpackCompileConfig", function webpackCompileConfigTask() {
    return webpackCompileConfiguration();
  });
  /**
   * A gulp build task to run the webpack dev server
   * @member {Gulp} webpackDevServer
   * @return {through2} stream
   */
  gulp.task("webpackDevServer", function webpackDevServerTask() {
    var NODE_MODULES_DIR = path.join(__dirname, "../../node_modules");
    var logger = context.logger;
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = pkg.directories;
    var webpackDevServer = require(path.join(cwd, directories.client + "/config/webpack.dev.server.js"));
    var webpackConfig = require(path.join(cwd, directories.client + "/config/webpack.config.dev.js"));
    webpackConfig.resolveLoader = {"modulesDirectories": [NODE_MODULES_DIR]};
    if (R.isNil(webpackConfig.entry.main)) {
      logger.error("Was expecting a 'main' entry point in the Webpack config");
    }
    webpackConfig.entry.main = [
      NODE_MODULES_DIR + '/webpack-dev-server/client?http://localhost:2999',
      NODE_MODULES_DIR + '/webpack/hot/only-dev-server',
      webpackConfig.entry.main
    ];

    return webpackDevServer(webpackConfig).listen(2999, "localhost", function server(err) {
      if (err) {
        logger.error("[webpack-dev-server]" + err);
      }
      // Server listening
      logger.info("[webpack-dev-server] http://localhost:2999/webpack-dev-server/index.html");

      // keep the server alive or continue?
      // callback();
    });
  });
};
