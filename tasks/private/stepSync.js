"use strict";

/**
 * A module to add gulp tasks which synchronise test steps from feature files with JIRA.
 * @exports tasks/stepSyncTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function stepSyncTasks(gulp, context) {
  var path = require("path");
  var fs = require("fs");
  var mkdirp = require("mkdirp");
  var jira = require("../../lib/utils/jira")();
  var vasync = require("vasync");
  var _ = require("underscore");
  var glob = require("glob");
  var Yadda = require("yadda");
  var parser = new Yadda.parsers.FeatureParser();
  var logger = context.logger;

  var createNewFeature = function createNewFeature(value, testDirectory) {
    //identify component (last component in array)
    //@todo find component in nested folder
    var componentDirectory;
    var component = "";
    var featureContents;
    var descriptionArray;
    var fileName;

    if (value.issue.components.length > 0) {
      component = value.issue.components[value.issue.components.length - 1].name;
    }
    componentDirectory = process.cwd() + path.sep +
      testDirectory + path.sep + "functional" + path.sep +
      component;

    featureContents = "Feature: " + value.issue.summary + "\n";
    if (value.issue.description) {
      //add two spaces to each line of description
      descriptionArray = value.issue.description.split("\n");
      _.each(descriptionArray, function eachDescription(description) {
        featureContents = featureContents +
          "  " + description + "\n";
      });
    }
    featureContents = featureContents + "\n";

    if (value.issue.customfield_10101 !== null) {
      featureContents = featureContents + "  " + value.issue.customfield_10101.split("\n").join("\n    ");
    } else {
      featureContents = featureContents + "  @pending\n  Scenario: \n" +
        "\n" +
        "    Given\n" +
        "    When\n" +
        "    Then\n";
    }

    mkdirp.sync(componentDirectory); //make sure the directory exists
    //construct filename
    fileName = value.issue.summary.split(":")[0] + "-" + value.key + ".feature";
    fs.writeFileSync(componentDirectory + path.sep + fileName, featureContents);
    logger.info("Created: " + value.key + " in " + componentDirectory);
  };

  var getIssueAndIssueLinkUpdates = function getIssueAndIssueLinkUpdates(value) {

    //get last component path which is the last feature path
    var lastComponent = value.components[value.components.length - 1];

    //get issue links
    var outwardIssuelinks = _.filter(value.issue.issuelinks, function filterOutwardIssues(link) {
      return link.hasOwnProperty("outwardIssue") && link.type.id === "10003"; //filter on "relates to"
    });
    var sourceIssueLinks = _.map(outwardIssuelinks, function outwardIssueKey(link) {
      return link.outwardIssue.key;
    });
    var issueChanged = false, linksChanged = false, newLinks, oldLinks, returnUpdates = [], issueUpdate;

    //Prepare test scenario and issuelinks
    var testScenario = "", issuelinks = [], scenarioIdx, scenario, annotations, annotation;

    //parse feature file
    var featurePath = lastComponent.path, feature;
    try {
      feature = parser.parse(fs.readFileSync(process.cwd() + path.sep + featurePath).toString());
    } catch (err) { /* eslint no-empty:0 */
    }

    //iterate through test feature scenarios
    for (scenarioIdx = 0; scenarioIdx < feature.scenarios.length; scenarioIdx = scenarioIdx + 1) {
      scenario = feature.scenarios[scenarioIdx];
      annotations = scenario.annotations;
      for (annotation in annotations) {
        if (annotations.hasOwnProperty(annotation)) {
          testScenario = testScenario + "@" + annotation + "=" + annotations[annotation] + "\n";
          //add issuelinks
          if (annotation === "linked") {
            issuelinks = _.union(issuelinks, annotations[annotation].split(","));
          }
        }
      }
      testScenario = testScenario +
        "Scenario: " + scenario.title + "\n" +
        scenario.description.join("\n") + "\n" +
        scenario.steps.join("\n") + "\n";
    }

    //check for change to summary, description, component, or test scenario
    if (feature.title !== value.issue.summary) {
      issueChanged = true;
    }
    if (value.issue.description !== null &&
      feature.description.length > 0 &&
      value.issue.description.replace(/\r/g, "") !== feature.description.join("\n")) {
      issueChanged = true;
    }
    if (testScenario !== "" && value.issue.customfield_10101 === null) {
      issueChanged = true;
    }
    if (value.issue.customfield_10101 !== null && value.issue.customfield_10101.replace(/\r/g, "") !== testScenario) {
      issueChanged = true;
    }
    if (lastComponent.component !== "" && value.issue.components.length === 0) {
      issueChanged = true;
    }
    if (value.issue.components.length > 0 &&
      value.issue.components[value.issue.components.length - 1].name !== lastComponent.component) {
      issueChanged = true;
    }

    //check issuelink arrays _.difference([1,2], [1]) === [2]
    newLinks = _.difference(issuelinks, sourceIssueLinks);
    oldLinks = _.difference(sourceIssueLinks, issuelinks);
    if (newLinks.length > 0 || oldLinks.length > 0) {
      linksChanged = true;
    }

    if (issueChanged) {
      issueUpdate = {
        "query": "issue/" + value.key,
        "method": "put",
        "postData": {
          "update": {
            "components": []
          },
          "fields": {
            "summary": feature.title,
            "description": feature.description.join("\n"),
            "customfield_10101": testScenario
          }
        }
      };
      if (value.issue.components.length > 0) {
        issueUpdate.postData.update.components.push({
          "remove": {
            "name": value.issue.components[value.issue.components.length - 1].name
          }
        });
      }
      if (lastComponent.component !== "") {
        issueUpdate.postData.update.components.push({
          "add": {
            "name": lastComponent.component
          }
        });
      }

      returnUpdates.push(issueUpdate);
    }

    if (linksChanged) {
      if (newLinks.length > 0) {
        _.each(newLinks, function eachNewLink(link) {
          returnUpdates.push({
            "query": "issueLink",
            "method": "post",
            "postData": {
              "type": {
                "id": "10003" //"relates to" issue link type
              },
              "inwardIssue": {
                "key": value.key //from this issue
              },
              "outwardIssue": {
                "key": link //to link
              }
            }
          });
        });
      }
      if (oldLinks.length > 0) {
        _.each(oldLinks, function eachOldLink(link, index) {
          returnUpdates.push({
            "query": "issueLink/" + outwardIssuelinks[index].id,
            "method": "delete"
          });
        });
      }
    }
    return returnUpdates;
  };

  /**
   * A gulp build task to download new test features from JIRA and upload changes to existing
   * feature files back to JIRA.
   * @member {Gulp} step_sync
   * @param {Function} cb - callback
   */
  gulp.task("step_sync", function stepSyncTask(cb) {
    var pkg = context.package;
    var directories = pkg.directories;

    vasync.waterfall([
      function getAllProjectFeatures(callback) {
        //get all issues of type feature from JIRA
        var jiraQuery = "";
        var queryFields = "";

        //check if the package config projectcode exists
        if (pkg.config && pkg.config.projectCode) {
          jiraQuery = "search?jql=(project = " + pkg.config.projectCode + " AND " +
            "issuetype in standardIssueTypes() AND issuetype = Feature AND Deprecated is EMPTY)";
          // customfield_10101 = Test Scenario
          // customfield_10800 = Deprecated
          queryFields =
            "&fields=Key,summary,description,components,customfield_10101,customfield_10800,issuetype,issuelinks";
        } else {
          logger.error("No projectCode in package.json");
        }

        jira.rest({"query": jiraQuery + queryFields}, callback);
      },
      function synchroniseWithJira(data, callback) {
        //create new feature files or update JIRA with changes in existing feature files

        //get list of feature paths for glob match
        var issues = _.map(data.issues, function mapComponentsToIssue(issue) {
          var featurePaths = glob.sync(directories.test + path.sep + "**" + path.sep + "*" + issue.key + ".feature");
          var components = _.map(featurePaths, function mapPathToComponent(comPath) {
            var subPath = comPath.replace(directories.test, "").replace("/functional", "");
            var componentHierarchy = subPath.split("/");
            var component = componentHierarchy.length > 1 ? componentHierarchy[componentHierarchy.length - 2] : "";
            //get component based on path
            return {
              "path": comPath,
              "component": component
            };
          });
          //return new flag, issue key, issue fields and component path array
          return {
            "new": components.length === 0,
            "key": issue.key,
            "issue": issue.fields,
            "components": components
          };
        });

        //create new features or update JIRA with content of existing features
        vasync.forEachPipeline({
            "func": function downloadNewFeaturesOrUploadChanges(issue, callbackFeature) {
              var issueAndIssueLinkUpdates;
              if (issue.new) {
                createNewFeature(issue, directories.test);
                callbackFeature();
              } else {
                issueAndIssueLinkUpdates = getIssueAndIssueLinkUpdates(issue);
                if (issueAndIssueLinkUpdates !== null) {
                  //update issue and/or issue links
                  vasync.forEachPipeline({
                    "func": function updateIssue(update, callbackUpdate) {
                      jira.rest(update, function updateIssueCallback(error, cbData) {
                        logger.info("Updated: " + update.query +
                          " - " + JSON.stringify(update.postData) +
                          " - " + cbData);
                        if (error) {
                          error = JSON.stringify(error);
                        }
                        callbackUpdate(error);
                      });
                    },
                    "inputs": issueAndIssueLinkUpdates
                  }, callbackFeature);
                } else {
                  //no issue or issue link updates
                  callbackFeature();
                }
              }
            },
            "inputs": issues
          },
          callback);
      }
    ], function stepSyncWaterfallCallback(err) {
      if (err) {
        logger.error(err);
      }
      cb(err);
    });
  });
};
