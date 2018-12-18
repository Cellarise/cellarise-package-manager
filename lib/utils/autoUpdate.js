"use strict";

/**
 * Auto update build utilities.
 * @exports utils/autoUpdate
 * @param {bunyan} logger - A logger matching the bunyan API
 * @returns {Object} Auto update build utility functions
 */
module.exports = function autoUpdateUtils(logger) {
  var vasync = require("vasync");
  var _ = require("underscore");
  var jiraUtils = require("./jira")(logger);
  var bambooUtils = require("./bamboo")(logger);
  var execUtils = require("../../bin/exec")(logger);
  var reportUtils = require("./reports")();
  var chalk = require("chalk");

  var rename = require("gulp-rename");
  var path = require("path");
  var GulpDustCompileRender = require("gulp-dust-compile-render");
  var AsyncPipe = require("gulp-async-func-runner");


  var exports = {
    /**
     * Run the update task on all projects matching specified criteria and generate output reports.
     * @param {Object} opts - options
     * @param {String} [opts.repositoryUrl] - the url to the repository containing packages for checking and update
     * @param {String} [opts.BUILD_DIR="Build"] - download the repository to this temporary build directory
     * @param {String} [opts.category=""] - all projects with this JIRA project category
     * are to be included on the update
     * @param {Array} [opts.include=[]] - array of short repository paths to be included in the update
     * @param {Array} [opts.exclude=[]] - array of short repository paths to be excluded in the update
     * @param {Boolean} [opts.updateCheck=false] - flag whether to run tasks to auto-check
     * whether an update is required
     * @param {String} [opts.updateCheckTask="all"] - gulp task used to auto-check whether an update is required
     * @param {Boolean} [opts.updateSource=false] - flag whether to run tasks to auto-update the source
     * and then commit
     * @param {String} [opts.updateSourceTask="all"] - gulp task used to auto-update the source
     * @param {String} [opts.updateSourceSummary=""] - the summary description for the issue created to track
     * source update progress
     * @param {String} [opts.updateSourceType="Non-functional"] - the issue type for the issue created to track
     * source update progress
     * @param {String} [opts.bambooBuildTask="all"] - gulp task used for Bamboo build
     * @param {String} [opts.bambooPostBuildTask="post_build"] - gulp task used for Bamboo post build
     * @param {Function} gulp - gulp object used to wrap the `autoUpdate` function in a gulp task
     * @param {Object} context - context object passed to gulp tasks used to obtain context.cwd - current working
     * directory
     * @returns {through2} stream
     */
    "run": function run(opts, gulp, context) {
      var self = this;
      var results = {};
      var directories = context.package.directories || {};
      var reportPath = path.join(context.cwd, directories.reports || "reports");
      return gulp.src(path.join(__dirname, "../../tasks/templates/auto-update-report.dust"))
        .pipe(new AsyncPipe({
            "oneTimeRun": true,
            "passThrough": true
          },
          function runAutoUpdate(op, chunk, cb) {
            self.autoUpdate(opts, cb);
          },
          function writeReports(error, autoUpdateWorkflows) {
            //save results for reports
            var reportWriter = require("../reports/autoUpdateMocha")();
            var report = reportWriter.prepare();

            logger.debug(JSON.stringify(autoUpdateWorkflows, null, 2));

            _.each(autoUpdateWorkflows, function eachAutoUpdateWorkflow(workflowHistory) {
              //ensure properties exist
              _.defaults(workflowHistory, {
                "bambooTest": {
                  "buildState": null
                },
                "releasedVersion": {
                  "name": null,
                  "issuesUnresolvedCount": null
                },
                "bambooRelease": {
                  "buildNumber": null,
                  "buildState": null
                }
              });
              reportWriter.write(workflowHistory, report);
            });
            reportWriter.writeToFileSync(reportPath + "/autoUpdate-mocha-tests.json", report);
            results.projects = autoUpdateWorkflows;
          }))
        .pipe(new GulpDustCompileRender(results))
        .pipe(rename(function renameExtension(renamePath) {
            renamePath.extname = ".html";
        }))
        .pipe(gulp.dest(reportPath));
    },

    /**
     * Execute update task on all projects matching specified criteria.
     * @param {Object} opts - options
     * @param {String} [opts.repositoryUrl] - the url to the repository containing packages for checking and update
     * @param {String} [opts.BUILD_DIR="Build"] - download the repository to this temporary build directory
     * @param {String} [opts.category=""] - all projects with this JIRA project category are
     * to be included on the update
     * @param {Array} [opts.include=[]] - array of short repository paths to be included in the update
     * @param {Array} [opts.exclude=[]] - array of short repository paths to be excluded in the update
     * @param {Boolean} [opts.updateCheck=false] - flag whether to run tasks to auto-check whether
     * an update is required
     * @param {String} [opts.updateCheckTask="all"] - gulp task used to auto-check whether an update is required
     * @param {Boolean} [opts.updateSource=false] - flag whether to run tasks to auto-update the source
     * and then commit
     * @param {String} [opts.updateSourceTask="all"] - gulp task used to auto-update the source
     * @param {String} [opts.updateSourceSummary=""] - the summary description for the issue created to track
     * source update progress
     * @param {String} [opts.updateSourceType="Non-functional"] - the issue type for the issue created to track
     * source update progress
     * @param {String} [opts.bambooBuildTask="all"] - gulp task used for Bamboo build
     * @param {String} [opts.bambooPostBuildTask="post_build"] - gulp task used for Bamboo post build
     * @param {Function} cb - callback function with signature: function(err, data)
     * @example
     {>example-autoUpdate/}
     */
    "autoUpdate": function autoUpdate(opts, cb) {
      var self = this;
      var updateProjectAsyncFuncArray = [];

      logger.info(chalk.cyan("Starting auto update task"));
      opts = opts || {};
      _.defaults(opts, {
        "BUILD_DIR": "Build",
        "category": "",
        "include": [],
        "exclude": [],
        "updateCheck": false,
        "updateCheckTask": "all",
        "updateSource": false,
        "updateSourceTask": "all",
        "updateSourceSummary": "",
        "updateSourceType": "Non-functional",
        "bambooBuildTask": "all",
        "bambooPostBuildTask": "post_build"
      });

      //get start list of projects to check/update using project category
      jiraUtils.getProjects(function getProjectsCallback(error, data) {
        var i;
        var updateProjectFunc = function updateProjectFunc(repositoryPath, project) {
          var buildPlanName = repositoryPath.split("/").join(" - ").toLowerCase();
          //need to convert the avatarUrls properties to start with a character
          //so that dust template can use them.
          project.avatarUrls.xsmall = project.avatarUrls["16x16"];
          project.avatarUrls.small = project.avatarUrls["24x24"];
          project.avatarUrls.medium = project.avatarUrls["32x32"];
          project.avatarUrls.large = project.avatarUrls["48x48"];
          project.shortName = project.name.split("/")[1];
          return function updateProject(arg, callback) {
            _.extend(opts, {
              "buildPlanName": buildPlanName,
              "repositoryPath": repositoryPath,
              "project": project
            });
            self.updateProject(opts, function updateProjectCallback(err, workflowHistory) {
              callback(err, workflowHistory);
            });
          };
        };

        if (!error) {
          for (i = 0; i < data.length; i = i + 1) {
            if ((data[i].projectCategory && data[i].projectCategory.name === opts.category ||
              _.contains(opts.include, data[i].key)) && !_.contains(opts.exclude, data[i].key)) {
              updateProjectAsyncFuncArray.push(updateProjectFunc(data[i].name, data[i]));
            }
          }
          vasync.pipeline({
            "funcs": updateProjectAsyncFuncArray
          }, function updateProjectAsyncFuncArrayCallback(err, results) {
            logger.info(chalk.cyan("Finished auto update task"));
            cb(err, results.successes);
          });
        } else {
          cb(error);
        }
      });
    },

    /**
     * Execute update task on a project.
     * @param {Object} opts - options
     * @param {String} opts.BUILD_DIR - download the repository to this temporary build directory
     * @param {String} opts.repositoryUrl - the url to the repository containing packages for checking and update
     * @param {String} opts.repositoryPath - short repository path of project to be processed
     * @param {Object} opts.project - the JIRA project metadata
     * @param {Boolean} opts.updateCheck - flag whether to run tasks to auto-check whether an update is required
     * @param {String} opts.updateCheckTask - gulp task used to auto-check whether an update is required
     * @param {Boolean} opts.updateSource - flag whether to run tasks to auto-update the source and then commit
     * @param {String} opts.updateSourceTask - gulp task used to auto-update the source
     * @param {Boolean} opts.releaseVersion - flag whether to release the patch version for an update
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "updateProject": function updateProject(opts, cb) {
      var self = this;
      var workflowHistory = {
        "project": opts.project,
        "clearFolder": null,
        "updateCheck": null,
        "updateCheckText": null,
        "updateSourceJiraIssue": null,
        "bambooTest": null,
        "bambooRelease": null,
        "transitionedIssue": null,
        "releasedVersion": null,
        "clearedBuildFolder": null
      };

      logger.info(opts.project.key + " " + opts.project.name + ": " + chalk.magenta("Starting auto update"));

      vasync.waterfall([
        function preAutoUpdate(callback) {
          logger.info(opts.project.key + " " + opts.project.name + ": " + chalk.magenta("Pre auto update"));
          logger.debug("CPM clear folder: " + opts.BUILD_DIR);
          execUtils.clearFolder(opts.BUILD_DIR, function clearFolderCallback(err) {
            workflowHistory.clearFolder = "Cleared folder " + opts.BUILD_DIR;
            callback(err);
          });
        },
        function updateCheck(callback) {
          if (opts.updateCheck) {
            logger.info(opts.project.key + " " + opts.project.name + ": " + chalk.magenta("Update check"));
            self.updateCheck(opts, function updateCheckCallback(err, reportFailures) {
              if (!err) {
                workflowHistory.updateCheck = "" + (reportFailures.length > 0);
                callback(null, reportFailures.length > 0);
              } else {
                callback(err, false);//set to false to stop workflow
              }
            });
          } else {
            callback(null, true); //updateRequired=true if no updateCheck required
          }
        },
        function updateSource(updateRequired, callback) {
          if (updateRequired && opts.updateSource) { //updateRequired will be true if no check performed
            logger.info(opts.project.key + " " + opts.project.name + ": " + chalk.magenta("Update source"));
            self.updateSource(opts, function updateSourceCallback(err, issue) {
              //JIRA issue created to record update task
              workflowHistory.updateSourceJiraIssue = issue;
              callback(err, updateRequired && err === null, issue);
            });
          } else {
            //buildRequired=true && updateRequired if no updateSource required
            callback(null, updateRequired, null);
          }
        },
        function testBuild(buildRequired, issue, callback) {
          if (buildRequired && issue !== null) {
            logger.info(opts.project.key + " " + opts.project.name + ": " + chalk.magenta("Test build"));
            logger.info("Bamboo trigger build: " + opts.buildPlanName);
            bambooUtils.triggerBamboo(opts.buildPlanName, {
              "gulp_task": opts.bambooBuildTask,
              "gulp_post_task": opts.bambooPostBuildTask
            }, function triggerBambooCallback(err, buildResult) {
              workflowHistory.bambooTest = buildResult;
              callback(err, buildResult, issue);
            });
          } else {
            callback(null, null, issue); //buildRequired=false
          }
        },
        function releaseBuild(buildResult, issue, callback) {
          if (buildResult && buildResult.successful === false) {
            logger.error("Build unsuccessful");
          }
          if (opts.releaseVersion && buildResult && buildResult.successful) {
            logger.info(opts.project.key + " " + opts.project.name + ": " + chalk.magenta("Release build"));
            self.releaseBuild(issue, workflowHistory, opts, function releaseBuildCallback(err) {
              callback(err);
            });
          } else {
            callback(null);
          }
        },
        function postAutoUpdate(callback) {
          logger.info(opts.project.key + " " + opts.project.name + ": " + chalk.magenta("Post auto update"));
          logger.debug("CPM clear folder: " + opts.BUILD_DIR);
          execUtils.clearFolder(opts.BUILD_DIR, function clearFolderCallback(err) {
            workflowHistory.clearedBuildFolder = true;
            callback(err);
          });
        }
      ], function finishAutoUpdate(err) {
        logger.info(opts.project.key + " " + opts.project.name + ": " + chalk.magenta("Finished auto update"));
        cb(err, workflowHistory);
      });
    },

    /**
     * Check whether an update is required by cloning the master branch of the project to a directory and
     * running a provided gulp task. The provided gulp task is expected to generate test reports.
     * The test reports are checked for any failures. If one or more failures found then this function
     * will return false in the callback data. Otherwise this function will return true in the callback data.
     * @param {Object} opts - options
     * @param {String} opts.BUILD_DIR - download the repository to this temporary build directory
     * @param {String} opts.repositoryUrl - the url to the repository containing packages for checking and update
     * @param {String} opts.repositoryPath - short repository path of project to be cloned to the BUILD_DIR
     * @param {String} opts.updateCheckTask - gulp task used to perform the update check
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "updateCheck": function updateCheck(opts, cb) {
      vasync.waterfall([
        function cloneProjectFromGit(callback) {
          execUtils.cloneFromGit(opts.repositoryUrl + opts.repositoryPath, opts.BUILD_DIR, null,
            function cloneFromGitCallback(err, stdout) {
              callback(err, stdout);
            });
        },
        function runUpdateCheckTask(data, callback) {
          execUtils.runGulpTask(opts.updateCheckTask, process.cwd() + "/" + opts.BUILD_DIR,
            function runGulpTaskCallback(err, cbData) {
              callback(err, cbData);
            });
        },
        function getReportFailures(data, callback) {
          callback(null, reportUtils.getReportFailures(opts.BUILD_DIR + "/Reports"));
        }
      ], cb);
    },

    /**
     * Update the source of a project by cloning the master branch of the project and running the provided
     * gulp task. A JIRA issue is created to track the progress of the update. The issue is transitioned to
     * In Progress and QA. Once the update is complete the source is committed back to the repository triggering
     * a Bamboo build on the master branch.
     * @param {Object} opts - options
     * @param {String} opts.BUILD_DIR - download the repository to this temporary build directory
     * @param {String} opts.repositoryUrl - the url to the repository containing packages for checking and update
     * @param {String} opts.repositoryPath - short repository path of project to be processed
     * @param {String} opts.updateSourceTask - gulp task used to auto-update the source
     * @param {String} opts.updateSourceSummary - the summary description for the issue created to track source
     * update progress
     * @param {String} opts.updateSourceType - the issue type for the issue created to track source update progress
     * @param {Function} cb - callback function with signature: function(err, issue)
     */
    "updateSource": function updateSource(opts, cb) {
      vasync.waterfall([
        function getNextUnreleasedPatchVersion(callback) {
          logger.info("JIRA get next unreleased path version for project: " + opts.project.key);
          jiraUtils.getNextUnreleasedPatchVersion(opts.project.key,
            function getNextUnreleasedPatchVersionCallback(err, version) {
              callback(err, version);
            });
        },
        function createNewIssue(version, callback) {
          logger.info("JIRA create issue with version: v" + version);
          jiraUtils.createIssue({
              "key": opts.project.key,
              "summary": opts.updateSourceSummary,
              "issueType": opts.updateSourceType,
              "version": version
            },
            function createIssueCallback(err, issue) {
              issue = issue || {}; //only id, key and selfURL properties returned
              issue.version = version;
              callback(err, issue);
            });
        },
        function transitionIssueToInProgress(issue, callback) {
          logger.info("JIRA transition issue to in progress: " + issue.key);
          jiraUtils.transitionIssue(issue.key, "11", function transitionIssueCallback(err) {
            callback(err, issue);
          });
        },
        function cloneFromGit(issue, callback) {
          var clone;
          if (!opts.updateCheck) {
            clone = opts.repositoryUrl + opts.repositoryPath;
            logger.info("GIT clone: " + clone);
            execUtils.cloneFromGit(clone, opts.BUILD_DIR, null, function cloneFromGitCallback(err) {
              callback(err, issue);
            });
          } else {
            callback(null, issue);
          }
        },
        function runUpdateSourceTask(issue, callback) {
          logger.info("Gulp task: " + opts.updateSourceTask);
          execUtils.runGulpTask(opts.updateSourceTask, process.cwd() + "/" + opts.BUILD_DIR,
            function runGulpTaskCallback(err) {
              callback(err, issue);
            });
        },
        function commitChanges(issue, callback) {
          var commit = issue.key + " [Auto-update] " + opts.updateSourceSummary;
          logger.info("GIT commit: " + commit);
          execUtils.commitGit(commit, process.cwd() + "/" + opts.BUILD_DIR, function commitGitCallback(err) {
            callback(err, issue);
          });
        },
        function transitionIssueToQA(issue, callback) {
          logger.info("JIRA transition issue to QA: " + issue.key);
          jiraUtils.transitionIssue(issue.key, "71", function transitionIssueCallback(err) {
            callback(err, issue);
          });
        }
      ], cb);
    },


    /**
     * Transition issue to "done", release a Jira project version, and if there are no unresolved issues
     * then trigger a release build.
     * @param {Object} issue - JIRA issue object map containing the properties `key` and `version`
     * @param {Object} workflowHistory - workflow history object map which will have following properties updated:
     * workflowHistory.transitionedIssue - true if issues transitioned to Done
     * workflowHistory.releasedVersion - JIRA version object map where property `released` will be true if there
     * are no unresolved issues
     * workflowHistory.bambooBuildResults - Bamboo build results object map
     * @param {Object} opts - options
     * @param {String} opts.project - JIRA project object map containing properties `key` and `name`
     * @param {String} opts.buildPlanName - Bamboo build plan name
     * @param {Function} cb - callback function with signature: function(err, result)
     */
    "releaseBuild": function releaseBuild(issue, workflowHistory, opts, cb) {
      vasync.waterfall([
        function transitionIssueToDone(callback) {
          logger.info("JIRA transition issue to Done: " + issue.key);
          jiraUtils.transitionIssue(issue.key, "91", function transitionIssueCallback(err) {
            workflowHistory.transitionedIssue = true;
            callback(err);
          });
        },
        function releaseVersion(callback) {
          logger.info("JIRA release version: " + opts.project.key + " - v" + issue.version);
          jiraUtils.releaseVersion(opts.project.key, issue.version, new global.Date(),
            function releaseVersionCallback(err, versionObj) {
              workflowHistory.releasedVersion = versionObj;
              callback(err, versionObj);
            });
        },
        function triggerReleaseBuild(versionObj, callback) {
          if (versionObj.released) {
            logger.info("Bamboo trigger release build: " + opts.buildPlanName + " - v" + issue.version);
            bambooUtils.triggerBamboo(opts.buildPlanName, {
              "jira.version": issue.version,
              "jira.projectName": opts.project.name
            }, function triggerBambooCallback(err, buildResult) {
              workflowHistory.bambooRelease = buildResult;
              callback(err, versionObj, buildResult);
            });
          } else {
            callback(null, versionObj, null);
          }
        }
      ], cb);
    }
  };

  return exports;
};
