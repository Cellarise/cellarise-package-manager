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
  var GulpDustCompileRender = require("gulp-dust-compile-render");
  var rename = require("gulp-rename");
  var fs = require("fs");
  var R = require('ramda');

  var webpackCompileIndexTaskGeneric = function webpackCompileIndexTaskGeneric(testMode) {
    //read Build/package.json is exists (i.e. created by metadata) or read /package.json
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = R.defaultTo({
      "lib": "lib",
      "bin": "bin",
      "doc": "doc",
      "tasks": "tasks",
      "templates": "templates",
      "test": "Test",
      "testLibrary": "Test\\libraries",
      "reports": "Reports",
      "build": "Build",
      "config": "client\\source\\config",
      "client": "client",
      "server": "server",
      "common": "common",
      "packages": "jspm_packages"
    }, pkg.directories);
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
    return gulp.src(directories.client + "/index.dust")
      .pipe(new GulpDustCompileRender(R.assoc("testMode", testMode + "", templatePkg), {"helper": "dustjs-helpers"}))
      .pipe(rename(function renameExtension(renamePath) {
        renamePath.extname = ".html";
      }))
      .pipe(gulp.dest(directories.client));
  };
  var webpackCompiler = function webpackCompiler(configCompilerPath, configPath, compileDir) {
    var jeditor = require("gulp-json-editor");
    fs.writeFileSync(configPath, JSON.stringify({}), 'utf8');

    return gulp.src(configPath)
      .pipe(jeditor(function compileConfig() {
        var compiledConfig;
        try {
          compiledConfig = require(configCompilerPath);
        } catch (err) {
          compiledConfig = {};
        }
        return compiledConfig;
      }))
      .pipe(gulp.dest(compileDir));
  };
  var webpackCompileRoutes = function webpackCompileRoutes() {
    //read Build/package.json is exists (i.e. created by metadata) or read /package.json
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = pkg.directories;
    var configDir = directories.config || directories.client + "/source/scripts/config"; //for backwards compatibility
    var routeCompilerPath = path.join(cwd, configDir + "/routeCompiler.js");
    var routePath = path.join(cwd, configDir + "/routes.json");
    var routeCompileDir = path.join(cwd, configDir);
    return webpackCompiler(routeCompilerPath, routePath, routeCompileDir);
  };
  var webpackCompileConfiguration = function webpackCompileConfiguration() {
    //read Build/package.json is exists (i.e. created by metadata) or read /package.json
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = pkg.directories;
    var configDir = directories.config || directories.client + "/source/scripts/config"; //for backwards compatibility
    var configCompilerPath = path.join(cwd, configDir + "/configCompiler.js");
    var configPath = path.join(cwd, configDir + "/config.json");
    var configCompileDir = path.join(cwd, configDir);
    return webpackCompiler(configCompilerPath, configPath, configCompileDir);
  };
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
  gulp.task("webpackCompileIndexTestMode", function webpackCompileIndexTask() {
    return webpackCompileIndexTaskGeneric(true);
  });
  /**
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpackCompileConfig", function webpackCompileConfigTask() {
    return webpackCompileConfiguration();
  });
  /**
   * @member {Gulp} webpack
   * @return {through2} stream
   */
  gulp.task("webpackCompileRoutes", function webpackCompileRoutesTask() {
    return webpackCompileRoutes();
  });
  /**
   * A gulp build task to run the webpack dev server
   * @member {Gulp} webpackDevServer
   * @return {through2} stream
   */
  gulp.task("webpackDevServer", function webpackDevServerTask() {
    var NODE_MODULES_DIR = path.resolve(path.join(__dirname, "../../node_modules"));
    var logger = context.logger;
    var pkg = context.package;
    var cwd = context.cwd;
    var directories = pkg.directories;
    var webpackDevServer = require(path.join(cwd, directories.client + "/config/webpack.dev.server.js"));
    var webpackConfig = require(path.join(cwd, directories.client + "/config/webpack.config.dev.js"));
    webpackConfig.resolve.modules = R.concat(webpackConfig.resolve.modules, [NODE_MODULES_DIR]);
    webpackConfig.resolveLoader = {"modules": [NODE_MODULES_DIR, "node_modules"]};
    if (R.isNil(webpackConfig.entry.main)) {
      logger.error("Was expecting a 'main' entry point in the Webpack config");
    }

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
