"use strict";
/**
 * A module to add gulp tasks which run test steps.
 * @exports tasks/testTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function testTasks(gulp, context) {
  const vasync = require("vasync");
  var mocha = require("gulp-mocha");
  var mkdirp = require("mkdirp");
  var gutil = require("gulp-util");
  var glob = require("glob");
  var path = require("path");
  var fs = require("fs");
  var R = require("ramda");
  var istanbul = require("gulp-istanbul");
  var babel = require("babel-core/register");
  var logger = context.logger;
  var COVERAGE_VAR = "__cpmCoverage__";

  var lowerCaseFirstLetter = function lowerCaseFirstLetter(str) {
    return str.slice(0, 1).toLowerCase() + str.slice(1);
  };
  var mergeFileCoverage = function mergeFileCoverage(first, second) {
    var ret = JSON.parse(JSON.stringify(first)), i;
    delete ret.l; //remove derived info
    Object.keys(second.s).forEach(function processkeys(k) {
      ret.s[k] += second.s[k];
    });
    Object.keys(second.f).forEach(function processkeys(k) {
      ret.f[k] += second.f[k];
    });
    Object.keys(second.b).forEach(function processkeys(k) {
      var retArray = ret.b[k],
        secondArray = second.b[k];
      for (i = 0; i < retArray.length; i += 1) {
        retArray[i] += secondArray[i];
      }
    });
    return ret;
  };
  var processCoverage = function processCoverage(coverageData) {
    if (!global.__cpmCoverage__) {
      global.__cpmCoverage__ = {};
    }
    R.mapObjIndexed(
      function mapMergedCov(fileCov, filePath) {
        if (global.__cpmCoverage__.hasOwnProperty(filePath)
          && !coverageData.hasOwnProperty(filePath)) {
          //nothing
        } else if (!global.__cpmCoverage__.hasOwnProperty(filePath)
          && coverageData.hasOwnProperty(filePath)) {
          global.__cpmCoverage__[filePath] = coverageData[filePath];
        } else {
          global.__cpmCoverage__[filePath] =
            mergeFileCoverage(global.__cpmCoverage__[filePath], coverageData[filePath]);
        }
      },
      R.merge(coverageData, global.__cpmCoverage__)
    );
  };

  var handleError = function handleError(err) {
    logger.error(err.toString());
    if (process.env.CI) {
      throw new gutil.PluginError({
        "plugin": "Gulp Mocha",
        "message": err.toString()
      });
    }
    this.emit("end"); //jshint ignore:line
  };


  var test = function test(options = {
    "reporter": "spec",
    "outputCoverageReports": false,
    "applyContextTestCases": true
  }) {
    var reporter = options.reporter;
    var outputCoverageReports = options.outputCoverageReports;
    var applyContextTestCases = options.applyContextTestCases;
    var cwd = context.cwd;
    var pkg = context.package;
    var directories = pkg.directories;
    var sourceGlobStr = directories.lib + "/**/*.js";
    var scriptPath;
    var outputDir = path.join(cwd, directories.reports, "code-coverage"
      + (process.env.SELENIUM_PORT ? "-" + process.env.SELENIUM_PORT : ""));

    //make sure Temp folder exists before test
    mkdirp.sync(path.join(cwd, "Temp"));

    //require all library scripts to ensure istanbul picks up
    R.forEach(function eachSourceGlobStrFN(value) {
      scriptPath = path.resolve(process.cwd(), value);
      try {
        require(scriptPath); // Make sure all files are loaded to get accurate coverage data
        logger.info("Loaded: " + scriptPath);
      } catch (err) {
        logger.warn("Could not load: " + scriptPath);
      }
    }, glob.sync(sourceGlobStr));

    if (applyContextTestCases && context.argv.length === 2) {
      process.env.YADDA_FEATURE_GLOB = context.argv[1];
      logger.info("Set process.env.YADDA_FEATURE_GLOB=" + process.env.YADDA_FEATURE_GLOB);
    }

    if (outputCoverageReports) {
      return gulp.src(path.resolve(process.cwd(), directories.test + "/test.js"), {"read": false})
        .pipe(mocha({
          "compilers": {
            "js": babel
          },
          "bail": process.env.hasOwnProperty("bamboo_working_directory"),
          "reporter": reporter,
          "timeout": 600000
        }))
        .on("error", handleError)
        .pipe(istanbul.writeReports({
          "dir": outputDir,
          "coverageVariable": COVERAGE_VAR,
          "reporters": ["html", "lcov", require("istanbul-reporter-clover-limits"), "json-summary"],
          "reportOpts": {
            "dir": outputDir,
            "watermarks": pkg.config.coverage.watermarks
          }
        }))
        .pipe(istanbul.enforceThresholds({
          "coverageVariable": COVERAGE_VAR,
          "thresholds": {
            "each": {
              "statements": pkg.config.coverage.watermarks.statements[0],
              "branches": pkg.config.coverage.watermarks.branches[0],
              "lines": pkg.config.coverage.watermarks.lines[0],
              "functions": pkg.config.coverage.watermarks.functions[0]
            }
          }
        }));
    }
    return gulp.src(path.resolve(process.cwd(), directories.test + "/test.js"), {"read": false})
      .pipe(mocha({
        "compilers": {
          "js": babel
        },
        "bail": true,
        "reporter": reporter,
        "timeout": 600000
      }))
      .on("error", function onError(err) {
        //logger.error(err.toString());
        throw new gutil.PluginError({
          "plugin": "Gulp Mocha",
          "message": err.toString()
        });
      });
  };

  var writeTestPackageCoverage = function writeTestPackageCoverage(cb) {
    var cwd = context.cwd;
    var cwdForwardSlash = lowerCaseFirstLetter(cwd).replace("/", "\\");
    var pkg = context.package;
    var directories = pkg.directories;
    var outputDir = path.join(cwd, directories.reports, "code-coverage");
    var localPathCoverage = R.pipe(
      R.toPairs,
      R.map(function mapObjPair(objPair) {
        var filePath = lowerCaseFirstLetter(objPair[0]);
        return [filePath.replace(cwdForwardSlash, ""), objPair[1]];
      }),
      R.fromPairs
    )(global[COVERAGE_VAR]);
    //make sure outputDir exists and save the raw coverage file for future use
    mkdirp.sync(outputDir);
    fs.writeFile(
      path.join(
        outputDir, 'coverage' + (process.env.SELENIUM_PORT ? "-" + process.env.SELENIUM_PORT : "") + '.json'
      ),
      JSON.stringify(localPathCoverage), 'utf8',
      cb
    );
  };

  var writeSkippedReport = function writeSkippedReport(cb) {
    var cwd = context.cwd;
    var pkg = context.package;
    var directories = pkg.directories;
    var outputDir = path.join(cwd, directories.reports);
    logger.info("Skipping tests");

    //make sure the Reports directory exists - required for mocha-bamboo-reporter-bgo
    mkdirp.sync(path.join(cwd, directories.reports));
    fs.writeFile(
      path.join(
        outputDir, 'mocha-tests-skipped.json'
      ),
      JSON.stringify({
        "stats": {
          "suites": 1,
          "tests": 1,
          "passes": 1,
          "pending": 0,
          "failures": 0,
          "start": new Date(),
          "end": new Date(),
          "duration": 0
        },
        "failures": [],
        "passes": [{
          "title": "Skipped",
          "fullTitle": "Skipped",
          "duration": 0,
          "scenarioTitle": "Skipped",
          "featureTitle": "Skipped"
        }],
        "skipped": []
      }), 'utf8',
      function skipCb() {
        fs.writeFile(
          path.join(
            outputDir + '/code-coverage', 'clover-tests-skipped.json'
          ),
          JSON.stringify({
            "stats": {
              "suites": 1,
              "tests": 1,
              "passes": 1,
              "pending": 0,
              "failures": 0,
              "start": new Date(),
              "end": new Date(),
              "duration": 0
            },
            "failures": [],
            "passes": [{
              "title": "Skipped",
              "fullTitle": "Skipped",
              "duration": 0,
              "scenarioTitle": "Skipped",
              "featureTitle": "Skipped"
            }],
            "skipped": []
          }), 'utf8',
          cb
        );
      }
    );
  };

  /**
   * A gulp build task to instrument files.
   * Istanbul will override the node require() function to redirect to the instrumented files.
   * @member {Gulp} instrument
   * @return {through2} stream
   */
  gulp.task("instrument", function instrumentTask() {
    var pkg = context.package;
    var directories = pkg.directories;
    var sourceGlobStr = directories.lib + "/**/*.js";
    /**
     * Istanbul code coverage will not work if there are tasks containing local references.
     * For example, var x = require("../../lib/index");
     * Note: that if gulpfile.js contains `gulp.loadTasks(__dirname);` then all tasks will be loaded
     * in gulp modules and the tasks directory.
     * Make sure all these tasks do not require local references as defined above.
     */
    return gulp.src(sourceGlobStr)
      .pipe(istanbul({
        "coverageVariable": COVERAGE_VAR,
        "includeUntested": true
      }))
      .pipe(istanbul.hookRequire()); // Force `require` to return covered files
    // Covering files - note: finish event called when finished (not end event)
  });

  /**
   * A gulp build task to run test steps and calculate test coverage.
   * Test steps results will be output using mocha-bamboo-reporter-bgo reporter.
   * This task executes the Instrument task as a prerequisite.
   * @member {Gulp} test_cover
   * @return {through2} stream
   */
  gulp.task("test_cover", gulp.series(
    "instrument",
    function testCoverTask() {
      var cwd = context.cwd;
      var pkg = context.package;
      var directories = pkg.directories;
      var MOCHA_FILE_NAME = 'unit-mocha-tests' + (process.env.SELENIUM_PORT ? "-" + process.env.SELENIUM_PORT : "");

      //results file path for mocha-bamboo-reporter-bgo
      process.env.MOCHA_FILE = path.join(cwd, directories.reports, MOCHA_FILE_NAME + ".json");
      //make sure the Reports directory exists - required for mocha-bamboo-reporter-bgo
      mkdirp.sync(path.join(cwd, directories.reports));
      if (process.env.CI) {
        return test({
          "reporter": "spec",
          "outputCoverageReports": true,
          "applyContextTestCases": true
        });
      }
      return test({
        "reporter": "mocha-bamboo-reporter-bgo",
        "outputCoverageReports": true,
        "applyContextTestCases": true
      });
    }
  ));

  /**
   * A gulp build task to run test steps and calculate test coverage (but not output test coverage to prevent
   * gulp-istanbul issues with webdriverIO).
   * Test steps results will be output using mocha-bamboo-reporter-bgo reporter.
   * This task executes the Instrument task as a prerequisite.
   * @member {Gulp} test_cover
   * @return {through2} stream
   */
  gulp.task("test_cover_no_cov_report", function testCoverNoCovReportTask() {
    var cwd = context.cwd;
    var pkg = context.package;
    var directories = pkg.directories;
    var MOCHA_FILE_NAME = 'unit-mocha-tests' + (process.env.SELENIUM_PORT ? "-" + process.env.SELENIUM_PORT : "");

    //results file path for mocha-bamboo-reporter-bgo
    process.env.MOCHA_FILE = path.join(cwd, directories.reports, MOCHA_FILE_NAME + ".json");
    //make sure the Reports directory exists - required for mocha-bamboo-reporter-bgo
    mkdirp.sync(path.join(cwd, directories.reports));
    if (process.env.CI) {
      return test({
        "reporter": "spec",
        "outputCoverageReports": false,
        "applyContextTestCases": true
      });
    }
    return test({
      "reporter": "mocha-bamboo-reporter-bgo",
      "outputCoverageReports": false,
      "applyContextTestCases": true
    });
  });

  /**
   * A gulp build task to run test steps and calculate test coverage (but not output test coverage to prevent
   * gulp-istanbul issues with webdriverIO).
   * Test steps results will be output using mocha-bamboo-reporter-bgo reporter.
   * This task executes the Instrument task as a prerequisite.
   * @member {Gulp} test_cover
   * @return {through2} stream
   */
  gulp.task("test_cover_save_cov", gulp.series(
    "test_cover_no_cov_report",
    function testCoverTask(cb) {
      writeTestPackageCoverage(cb);
    }
  ));

  /**
   * A gulp build task to write coverage.
   * @member {Gulp} write_coverage
   * @return {through2} stream
   */
  gulp.task("write_coverage", function testWriteCoverage() {
    var cwd = context.cwd;
    var pkg = context.package;
    var directories = pkg.directories;
    var outputDir = path.join(cwd, directories.reports, "code-coverage");
    var outputDirs = [
      path.join(cwd, directories.reports, "1", "code-coverage"),
      path.join(cwd, directories.reports, "2", "code-coverage"),
      path.join(cwd, directories.reports, "3", "code-coverage"),
      path.join(cwd, directories.reports, "4", "code-coverage"),
      path.join(cwd, directories.reports, "5", "code-coverage"),
      path.join(cwd, directories.reports, "6", "code-coverage"),
      path.join(cwd, directories.reports, "7", "code-coverage"),
      path.join(cwd, directories.reports, "8", "code-coverage"),
      path.join(cwd, directories.reports, "9", "code-coverage"),
      path.join(cwd, directories.reports, "10", "code-coverage"),
      path.join(cwd, directories.reports, "11", "code-coverage"),
      path.join(cwd, directories.reports, "12", "code-coverage"),
      path.join(cwd, directories.reports, "13", "code-coverage"),
      path.join(cwd, directories.reports, "14", "code-coverage"),
      path.join(cwd, directories.reports, "15", "code-coverage"),
      path.join(cwd, directories.reports, "16", "code-coverage"),
      path.join(cwd, directories.reports, "17", "code-coverage"),
      path.join(cwd, directories.reports, "18", "code-coverage"),
      path.join(cwd, directories.reports, "19", "code-coverage"),
      path.join(cwd, directories.reports, "20", "code-coverage"),
      path.join(cwd, directories.reports, "NFR", "code-coverage")
    ];
    var coverageFileNames = [
      'coverage-4441.json',
      'coverage-4442.json',
      'coverage-4443.json'
    ];
    var fileContents;
    //read all coverage files and add to global[COVERAGE_VAR]
    R.forEach(
      function forEachOutputDir(reportDir) {
        R.forEach(
          function forEachFile(fileName) {
            try {
              fileContents = fs.readFileSync(path.join(reportDir, fileName));
              logger.info("Loaded: " + reportDir + fileName);
              //add find and replace for bamboo build server remote agents
              if (reportDir.indexOf("NHVR-REP") > -1) {
                processCoverage(
                  JSON.parse(fileContents
                    .toString('utf-8')
                    .replace(
                      /(C:|D:|E:|c:|d:|e:)\\\\bamboo.*?\\\\xml-data\\\\build-dir\\\\.*?NHVR.*?\\\\/g,
                      cwd.replace(/\\/g, "\\\\") + "\\\\"
                    )
                  )
                );
              } else {
                processCoverage(
                  JSON.parse(fileContents
                    .toString('utf-8')
                    .replace(
                      /(C:|D:|E:|c:|d:|e:)\\\\bamboo.*?\\\\xml-data\\\\build-dir\\\\.*?\\\\.*?\\\\/g,
                      cwd.replace(/\\/g, "\\\\") + "\\\\"
                    )
                  )
                );
              }
            } catch (err) {
              logger.info("Write coverage failed for: " + reportDir + fileName);
              return false;
            }
          },
          coverageFileNames
        );
      },
      outputDirs
    );

    //clean coverage
    delete global[COVERAGE_VAR].class;
    delete global[COVERAGE_VAR].hCode;
    delete global[COVERAGE_VAR].sessionId;
    delete global[COVERAGE_VAR].state;
    delete global[COVERAGE_VAR].status;
    delete global[COVERAGE_VAR].value;

    //copy path to file key
    global[COVERAGE_VAR] = R.pipe(
      R.toPairs,
      R.map(function mapObjPair(objPair) {
        var filePath = lowerCaseFirstLetter(objPair[0]);
        if (objPair[1].path) {
          filePath = lowerCaseFirstLetter(objPair[1].path);
        }
        return [filePath, objPair[1]];
      }),
      R.fromPairs
    )(global[COVERAGE_VAR]);


    return gulp.src(outputDir, {"read": false})
      .pipe(istanbul.writeReports({
        "dir": outputDir,
        "coverageVariable": COVERAGE_VAR,
        "reporters": ["html", "lcov", require("istanbul-reporter-clover-limits"), "json-summary"],
        "reportOpts": {
          "dir": outputDir,
          "watermarks": pkg.config.coverage.watermarks
        }
      }))
      .pipe(istanbul.enforceThresholds({
        "coverageVariable": COVERAGE_VAR,
        "thresholds": {
          "each": {
            "statements": pkg.config.coverage.watermarks.statements[0],
            "branches": pkg.config.coverage.watermarks.branches[0],
            "lines": pkg.config.coverage.watermarks.lines[0],
            "functions": pkg.config.coverage.watermarks.functions[0]
          }
        }
      }));
  });

  /**
   * A gulp build task to run test steps and calculate test coverage.
   * Test steps results will be output using spec reporter.
   * @member {Gulp} test
   * @return {through2} stream
   */
  gulp.task("test", function testTask() {
    return test({
      "reporter": "spec",
      "outputCoverageReports": true,
      "applyContextTestCases": true
    });
  });

  /**
   * A gulp build task to run test steps based on jira component and no calculation of test coverage.
   * Test steps results will be output using mocha-bamboo-reporter-bgo reporter.
   * @member {Gulp} test
   * @return {through2} stream
   */
  gulp.task("test_jira", function testTask() {
    return test({
      "reporter": "mocha-bamboo-reporter-bgo",
      "outputCoverageReports": false,
      "applyContextTestCases": false
    });
  });

  /**
   * A gulp build task to determine test cases to run.
   * First it will try to find a JIRA issue key in a branch name.
   * If found, it will search for its components and use them as test cases identifiers.
   * Otherwise, it will search for provided parameters in the context.
   * Test steps results will be output using spec reporter.
   * @member {Gulp} test_cover_jira_integration
   * @return {through2} stream
   */
  gulp.task("test_cover_jira_integration", () => {
    const jiraIssueManager = require("../lib/utils/jiraIssueManager");

    const skipTests = process.env.bamboo_SKIP_FUNCTIONAL_TESTS === "TRUE";
    const isFeatureOrBugBranch = !R.isNil(process.env.bamboo_repository_git_branch)
      && process.env.bamboo_repository_git_branch.match(new RegExp("(feature/|bug/)", "g"));

    //if skip tests then write empty skipped report
    if (skipTests) {
      writeSkippedReport(() => {});
      return;
    }
    //if not a bamboo feature/bug branch then run test_cover_no_cov_report and writeTestPackageCoverage
    if (!isFeatureOrBugBranch) {
      logger.info("Did not find a feature branch or bug branch");
      gulp.series(
        "test_cover_no_cov_report",
        function testCoverTask(cb) {
          writeTestPackageCoverage(cb);
        }
      )();
      return;
    }
    logger.info("Found a feature branch or bug branch");

    vasync.waterfall([
        function (callback) {
          jiraIssueManager.getJiraOauthClient(callback);
        },
        function (jiraOauthClient, callback) {
          jiraIssueManager.getJiraIssue(context, jiraOauthClient, callback);
        },
        function (issue, callback) {
          jiraIssueManager.getJiraTestCasesToRun(issue, callback);
        }
      ],
      function (error, jiraTestCases, issue) {
        if (!R.isEmpty(error) && !R.isNil(error)) {
          throw new Error(error);
        }
        if (R.isNil(issue)) {
          logger.info("Jira issue not found from branch name");
        } else {
          logger.info("Jira issue found from branch name: " + issue.key);
        }
        if (R.isNil(jiraTestCases)) {
          logger.info("No test cases found from Jira issue");
        } else {
          logger.info("Test cases found from Jira issue: " + jiraTestCases);
        }
        const testPackagesFromContext = context.argv.length === 2 ? context.argv[1] : null;
        //if no jiraTestCases or jiraTestCases not in test packages from context then skip
        if (R.isNil(jiraTestCases) || R.isNil(testPackagesFromContext)) {
          writeSkippedReport(() => {});
          return;
        } else if (jiraTestCases.indexOf(testPackagesFromContext) === -1) {
          logger.info("Test cases found from Jira issue did not match text cases found from context");
          writeSkippedReport(() => {});
          return;
        }

        process.env.YADDA_FEATURE_GLOB = jiraTestCases;

        const cwd = context.cwd;
        const pkg = context.package;
        const directories = pkg.directories;
        const MOCHA_FILE_NAME = 'unit-mocha-tests' + (process.env.SELENIUM_PORT ? "-" + process.env.SELENIUM_PORT : "");

        //results file path for mocha-bamboo-reporter-bgo
        process.env.MOCHA_FILE = path.join(cwd, directories.reports, MOCHA_FILE_NAME + ".json");
        //make sure the Reports directory exists - required for mocha-bamboo-reporter-bgo
        mkdirp.sync(path.join(cwd, directories.reports));

        gulp.series(
          "test_jira",
          function testCoverTask(cb) {
            writeTestPackageCoverage(cb);
          }
        )();
        return;
      });
  });

  /**
   * Create an Azure environment (if it does not exist) for a feature branch.
   * @member {Gulp} create_azure_env_for_jira_issue
   * @return {through2} stream
   */
  gulp.task('create_azure_env_for_jira_issue', () => {
    const azureEnvironmentManager = require("../lib/utils/azureEnvironmentManager");
    vasync.waterfall([
      function(callback) {
        azureEnvironmentManager.authenticateAzure(context, callback);

      }, function(credentials, callback) {
        logger.info("Authenticated with Azure");
        azureEnvironmentManager.getSubscriptionId(context, credentials, callback);

      }, function (credentials, subscriptionId, callback) {
        logger.info("Obtained Azure subscription id");
        azureEnvironmentManager.validateGroupAccess(context, credentials, subscriptionId, callback);

      }, function(credentials, subscriptionId, callback) {
        logger.info("Validated user access to resources in subscription");
        azureEnvironmentManager.getEnvironmentName(context, credentials, subscriptionId, callback);

      }, function (credentials, subscriptionId, websiteName, callback) {
        azureEnvironmentManager.checkWebsiteExists(context, credentials, subscriptionId, websiteName, callback);

      }, function (credentials, subscriptionId, websiteName, isExists, callback) {
        if (R.isNil(websiteName)) {
          callback(null, "Could not determine webapp environment name.");
          return;
        }
        if (isExists) {
          logger.info("Updating webapp environment: " + websiteName);
          azureEnvironmentManager.updateEnvironment(context, credentials, subscriptionId, websiteName, callback);
          return;
        }
        logger.info("Creating webapp environment: " + websiteName);
        azureEnvironmentManager.createEnvironment(context, credentials, subscriptionId, websiteName, callback);
      }

    ], function (error, websiteName) {

      if (!R.isNil(error)) {
        logger.error(error);
        throw new Error(error);
      }

      azureEnvironmentManager.createAzureWebAppVariablesFile(context);
      logger.info("Successfully configured webapp environment: " + websiteName);
    });
  });

  /**
   * Destroy an Azure environment (if it exists) for a feature branch.
   * @member {Gulp} delete_azure_env_for_jira_issue
   * @return {through2} stream
   */
  gulp.task('delete_azure_env_for_jira_issue', () => {
    const azureEnvironmentManager = require("../lib/utils/azureEnvironmentManager");
    vasync.waterfall([
      function(callback) {
        azureEnvironmentManager.authenticateAzure(context, callback);

      }, function(credentials, callback) {
        logger.info("Authenticated with Azure");
        azureEnvironmentManager.getSubscriptionId(context, credentials, callback);

      }, function (credentials, subscriptionId, callback) {
        logger.info("Obtained Azure subscription id");
        azureEnvironmentManager.validateGroupAccess(context, credentials, subscriptionId, callback);

      }, function(credentials, subscriptionId, callback) {
        logger.info("Validated user access to resources in subscription");
        azureEnvironmentManager.getEnvironmentName(context, credentials, subscriptionId, callback);

      }, function (credentials, subscriptionId, websiteName, callback) {
        azureEnvironmentManager.checkWebsiteExists(context, credentials, subscriptionId, websiteName, callback);

      }, function (credentials, subscriptionId, websiteName, isExists, callback) {
        if (R.isNil(websiteName)) {
          callback(null, "Could not determine webapp environment name.");
          return;
        }
        if (!isExists) {
          callback(null, "Webapp environment has previously been deleted: " + websiteName);
          return;
        }
        logger.info("Deleting webapp environment: " + websiteName);
        azureEnvironmentManager.deleteEnvironment(context, credentials, subscriptionId, websiteName, callback);
      }
    ], function (error) {

      if (!R.isNil(error)) {
        logger.error(error);
        throw new Error(error);
      }
      logger.info("Successfully deleted webapp environment");
    });
  });

  /**
   * Destroy an Azure environment (if it exists) for a feature branch.
   * @member {Gulp} delete_azure_env_for_jira_issue
   * @return {through2} stream
   */
  gulp.task('delete_azure_mssql_for_jira_issue', () => {
    const mssqlDatabaseManager = require("../lib/utils/mssqlDatabaseManager");
    mssqlDatabaseManager.deleteAllWebappDatabaseSchemaAndData(context, function (error) {

      if (!R.isNil(error)) {
        logger.error(error);
        throw new Error(error);
      }
      logger.info("Successfully deleted data and schema for webapp environment");
    });
  });
};
