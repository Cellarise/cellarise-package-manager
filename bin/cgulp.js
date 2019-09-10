#!/usr/bin/env node
// /*eslint no-process-exit:0*/
"use strict";
var packageJSON;
var context;
var failed;
var task;

const argv = require("minimist")(process.argv.slice(2));
const gulp = require("gulp");
const path = require("path");
const prettyTime = require("pretty-hrtime");
const fs = require("fs");
const v8 = require('v8');
/**
 * Setup logger
 */
const bunyanFormat = require("bunyan-format");
const formatOut = bunyanFormat({"outputMode": "short"});
const logger = require("bunyan").createLogger({"name": "CGULP", "stream": formatOut});
const chalk = require("chalk");

const cwd = process.cwd();
const totalHeapSize = v8.getHeapStatistics().total_available_size;
const totalHeapSizaInMB = (totalHeapSize / 1024 / 1024).toFixed(2);
logger.info("Node Total Heap Size", totalHeapSizaInMB, "MB");

/**
 * Format orchestrator errors
 * @param {Error} e - orchestrator error
 * @returns {String} formatted error message
 */
const formatError = function formatError(e) {
  if (!e.error) {
    return e.message;
  }

  // PluginError
  if (typeof e.error.showStack === "boolean") {
    return e.error.toString();
  }

  // normal error
  if (e.error.stack) {
    return e.error.stack;
  }

  // unknown (string, number, etc.)
  return new Error(String(e.error)).stack;
};

/**
 * Wire up logging events
 * @param {Gulp} gulpInst - gulp
 */
const logEvents = function logEvents(gulpInst) {

  gulpInst.on("start", function onTaskStart(e) {
    logger.info("Starting", "'" + chalk.cyan(e.name) + "'...");
  });

  gulpInst.on("stop", function onTaskStop(e) {
    const time = prettyTime(e.duration);
    logger.info(
      "Finished", "'" + chalk.cyan(e.name) + "'",
      "after", chalk.magenta(time));
  });

  gulpInst.on("error", function onTastErr(e) {
    const msg = formatError(e);
    const time = prettyTime(e.duration);
    logger.error(
      "'" + chalk.cyan(e.name) + "'",
      chalk.red("errored after"),
      chalk.magenta(time));
    logger.error(msg);
  });

  gulpInst.on("task_not_found", function onTaskNotFound(err) {
    logger.error("Task '" + err.name + "' is not in your gulpfile. " +
      "Please check the documentation for proper gulpfile formatting.");
    process.exit(1);
  });
};

/**
 * Log current working directory
 */
logger.info("Current working directory: ", chalk.magenta(cwd));

/**
 * Set NODE_PATH
 */
process.env.NODE_PATH = path.join(__dirname, "..", "node_modules");
require("module").Module._initPaths();
logger.info("Set NODE_PATH to: ", chalk.magenta(process.env.NODE_PATH));

/**
 * Check if package.json exists in target
 */
if (!fs.existsSync(cwd + "/package.json")) {
  logger.warn("Package.json file does not exist in the current working directory. " +
    "Please check the directory.");
  packageJSON = {};
} else {
  packageJSON = require(cwd + "/package.json");
}

/**
 * Setup context object to be passed to gulp tasks
 * @namespace
 * @property {String} cwd  - The current working directory
 * @property {JSON} package  - The package.json for the module
 * @property {Array} argv - The arguments past to the gulp task
 * @property {bunyan} logger - A logger matching the bunyan API
 */
context = {
  "cwd": cwd,
  "package": packageJSON,
  "argv": argv._,
  "logger": logger
};

/**
 * Get gulp-load-params and provide modulePrefix to load tasks that start with `gulp-tasks` in package.json
 * @type {"gulp-load-params"}
 */
require("gulp-load-params")(gulp, {"modulePrefix": "gulp-tasks"});
gulp.loadTasks(path.join(__dirname, ".."), context);
logger.info("Loaded tasks from: ", chalk.magenta(path.join(__dirname, "..")));

/**
 * Exit with 0 or 1
 */
failed = false;
process.once("exit", function exit(code) {
  if (code === 0 && failed) {
    process.exit(1);
  }
});

/**
 * Identify task
 */
if (argv._.length > 0) {
  task = argv._[0];
} else if (process.env.hasOwnProperty("bamboo_gulp_task")) {
  task = process.env.bamboo_gulp_task;
} else {
  task = "default";
}

/**
 * Setup event logger and start task
 */
logEvents(gulp);
//     tree = gulp.tree();
//     return logEvents(tree.nodes);
gulp.series(task)(function (err) {
  if (err) {
    process.exit(1);
  }
}); //run default gulp

