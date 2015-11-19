"use strict";

/**
 * JIRA build utilities
 * @exports utils/jira
 * @returns {Object} JIRA build utility functions
 */
module.exports = function jiraUtils() {
  var oauthRest = require("oauth-rest-atlassian").rest;
  var _ = require("underscore");
  var config = require("./config")("jira");
  var vasync = require("vasync");

  var exports = {
    /**
     * Send query to rest api.
     * @param {Object} opts - required options
     * @param {Object} [opts.query] - the rest query url
     * @param {Object} [opts.method="get"] - optional the http method - one of get, post, put, delete
     * @param {Object} [opts.postData=""] - optional the post data for create or update queries.
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "rest": function rest(opts, cb) {
      opts = _.defaults(opts, {
        "config": config
      });
      oauthRest(opts, cb);
    },

    /**
     * Get all JIRA projects.
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "getProjects": function getProjects(cb) {
      oauthRest({
        "config": config,
        "query": "project"
      }, cb);
    },

    /**
     * Create a JIRA issue.
     * @param {Object} issue - object map with properties required to create the issue
     * @param {String} issue.key - key for the JIRA project to create the issue within
     * @param {String} issue.summary - the summary description for the issue
     * @param {String} issue.issueType - the name of the issue type
     * @param {String} issue.version - the release version for the issue (fixversion)
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "createIssue": function createIssue(issue, cb) {
      //create update task in JIRA (non-func issue type) and get issue key
      oauthRest({
        "config": config,
        "query": "issue",
        "method": "post",
        "postData": {
          "fields": {
            "project": {
              "key": issue.key
            },
            "summary": issue.summary,
            "issuetype": {
              "name": issue.issueType
            },
            "fixVersions": [
              {
                "name": issue.version
              }
            ]
          }
        }
      }, cb);
    },

    /**
     * Delete a JIRA issue.
     * @param {String} key - the key for the JIRA issue to delete
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "deleteIssue": function deleteIssue(key, cb) {
      oauthRest({
        "config": config,
        "query": "issue/" + key,
        "method": "delete"
      }, cb);
    },

    /**
     * Create a new version in a JIRA project.
     * @param {String} key - the JIRA project key
     * @param {String} version - the version (semver)
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "createVersion": function createVersion(key, version, cb) {
      oauthRest({
          "config": config,
          "query": "version",
          "method": "post",
          "postData": {
            "project": key,
            "name": version
          }
        },
        function createVersionCallback(err, data) {
          cb(err, data);
        });
    },

    /**
     * Delete an existing version in a JIRA project.
     * @param {String} key - the JIRA project key
     * @param {String} version - the version (semver)
     * @param {Function} cb - callback function with signature: function(err)
     */
    "deleteVersion": function deleteVersion(key, version, cb) {
      vasync.waterfall([
        function getProjectVersions(callback) {
          oauthRest({
            "config": config,
            "query": "project/" + key + "/versions"
          }, callback);
        },
        function getVersionAndDelete(versions, callback) {
          var versionObj = _.find(versions, function matchVersion(v) {
            return v.name === version;
          });
          if (versionObj) {
            oauthRest({
              "config": config,
              "query": "version/" + versionObj.id,
              "method": "delete"
            }, callback);
          } else {
            callback("Version " + version + " not found in project " + key);
          }
        }
      ], cb);
    },

    /**
     * Release a version in a JIRA project.
     * The version will only be released if there are 0 unresolved issue linked to version.
     * @param {String} key - the JIRA project key
     * @param {String} version - the version (semver)
     * @param {Date} releaseDate - the release date
     * @param {Function} cb - callback function with signature: function(err, versionObj)
     * Where versionObj is an object with the following properties:
     * versionObj.id {String} - the version id
     * versionObj.name {String} - the version (semver)
     * versionObj.released {Boolean} - has the version been released
     * versionObj.releaseDate {String} - the planned (if released=false) or actual (if released=true) release date
     * versionObj.issuesUnresolvedCount {Number} - the number of unresolved issue linked to version
     */
    "releaseVersion": function releaseVersion(key, version, releaseDate, cb) {
      //convert date to a string in format YYYY-MM-DD
      var releaseDateStr =
        releaseDate.getFullYear() + "-" +
        ("" + (releaseDate.getMonth() + 1)).slice(-2) + "-" +
        ("0" + releaseDate.getDate()).slice(-2);

      vasync.waterfall([
        function getProjectVersions(callback) {
          oauthRest({
            "config": config,
            "query": "project/" + key + "/versions"
          }, callback);
        },
        function getIssuesUnresolvedCount(versions, callback) {
          var versionObj = _.find(versions, function matchVersion(v) {
            return v.name === version;
          });
          if (versionObj) {
            oauthRest({
              "config": config,
              "query": "version/" + versionObj.id + "/unresolvedIssueCount"
            }, function getVersionCallback(err, data) {
              data = data || {};
              versionObj.issuesUnresolvedCount = data.issuesUnresolvedCount;
              callback(err, versionObj);
            });
          } else {
            callback("Version " + version + " not found in project " + key);
          }
        },
        function releaseIfZeroIssuesUnresolved(versionObj, callback) {
          if (versionObj.issuesUnresolvedCount === 0) {
            oauthRest({
                "config": config,
                "query": "version/" + versionObj.id,
                "method": "put",
                "postData": {
                  "released": true,
                  "releaseDate": releaseDateStr
                }
              },
              function getVersionCallback(err) {
                if (!err) {
                  versionObj.released = true;
                  versionObj.releaseDate = releaseDateStr;
                }
                callback(err, versionObj);
              });
          } else {
            //Note: versionObj.released will remain false
            callback(null, versionObj);
          }
        }
      ], cb);
    },

    /**
     * Transition a JIRA issue.
     * @param {String} key - key for the JIRA issue to transition
     * @param {String} transition - the transition id
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "transitionIssue": function transitionIssue(key, transition, cb) {
      oauthRest({
        "config": config,
        "query": "issue/" + key + "/transitions",
        "method": "post",
        "postData": {
          "transition": {
            "id": transition
          }
        }
      }, cb);
    },

    /**
     * Get the next unresolved and unreleased minor version for the project (based on semver).
     * If there is an existing unresolved and unreleased major or minor version then the earliest is returned.
     * @param {String} key - the JIRA project key
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "getNextUnreleasedPatchVersion": function getNextUnreleasedPatchVersion(key, cb) {
      var self = this;
      oauthRest({
        "config": config,
        "query": "project/" + key + "/versions"
      }, function getProjectVersionsCallback(err, versions) {
        var lastReleasedVersion = "0.0.0";
        var nextUnreleasedPatchVersion = null;
        var releasedVersions;
        var unreleasedVersions;
        var lastReleasedVersionArray;

        if (!err) {
          if (versions.length > 0) {
            //sort in semver order (assumes name of version is in semver format)
            versions = _.sortBy(versions, function semanticVersionSorter(version) {
              var versionArray = version.name.split(".");
              version =
                parseInt(versionArray[0], 10) * 1000000 +
                parseInt(versionArray[1], 10) * 1000 +
                parseInt(versionArray[2], 10);
              return version;
            });

            //get released versions
            releasedVersions = _.filter(versions, function releasedVersionFilter(version) {
              return version.released && !version.archived;
            });
            //get latest released version
            if (releasedVersions.length > 0) {
              lastReleasedVersion = releasedVersions[releasedVersions.length - 1].name;
            }

            //get unreleased versions
            unreleasedVersions = _.filter(versions, function unreleasedVersionFilter(version) {
              return !version.released && !version.archived;
            });
            //get earliest patch version
            if (unreleasedVersions.length > 0 &&
              parseInt(unreleasedVersions[0].name.split(".")[2], 10) > 0) {
              nextUnreleasedPatchVersion = unreleasedVersions[0].name;
            }
          }

          if (nextUnreleasedPatchVersion === null) {
            //create new patch version
            lastReleasedVersionArray = lastReleasedVersion.split(".");
            nextUnreleasedPatchVersion =
              lastReleasedVersionArray[0] + "." +
              lastReleasedVersionArray[1] + "." +
              (parseInt(lastReleasedVersionArray[2], 10) + 1);

            self.createVersion(key, nextUnreleasedPatchVersion,
              function createVersionCallback(err2, version) {
                nextUnreleasedPatchVersion = null;
                if (!err2) {
                  nextUnreleasedPatchVersion = version.name;
                }
                cb(err2, nextUnreleasedPatchVersion);
              });
          } else {
            cb(err, nextUnreleasedPatchVersion);
          }
        } else {
          cb(err, nextUnreleasedPatchVersion);
        }
      });
    },

    /**
     * Get the changelog for a JIRA project.
     * @param {String} key - the JIRA project key
     * @param {Function} cb - callback function with signature: function(err, data)
     */
    "getChangelog": function getChangelog(key, cb) {
      var self = this;
      var jiraQuery = "search?maxResults=1000&jql=(project = " + key + " AND " +
        "issuetype in standardIssueTypes() AND issuetype != Task AND " +
        "resolution != Unresolved AND " +
        "fixVersion in (unreleasedVersions(), releasedVersions())) " +
        "ORDER BY fixVersion DESC, resolutiondate DESC";
      var queryFields =
        "&fields=*all";
      oauthRest({
        "config": config,
        "query": jiraQuery + queryFields
      }, function getChangelogCallback(err, data) {
        cb(err, self.prepareChangeLogJSON(data));
      });
    },

    /**
     * Tranform raw changelog data from a JQL query into a JSON object.
     * @param {Object} data - raw changelog data
     * @returns {Object} changelog JSON object
     * @example
     Raw changelog data:
     ```
     {
     "releases": [
         {
           "version": {
             "self": "https://jira.cellarise.com/rest/api/2/version/10516",
             "id": "10516",
             "name": "0.1.4",
             "archived": false,
             "released": true,
             "releaseDate": "2014-08-28"
           },
           "issues": []
         }
     }
     ```
     */
    "prepareChangeLogJSON": function prepareChangeLogJSON(data) {
      var changeLogJSON = {
          "releases": []
        },
        i,
        issues,
        currentIssue,
        currentVersion,
        release,
        releaseNum = -1,
        date = new Date();

      if (!data) {
        return {};
      }

      issues = data.issues;

      for (i = 0; i < issues.length; i = i + 1) {
        currentIssue = issues[i];
        currentVersion = currentIssue.fields.fixVersions[0];
        //first version or check for change in version
        if (!release || release.name !== currentVersion.name) {
          //check if version date set, otherwise set to current date
          if (!currentVersion.releaseDate) {
            currentVersion.releaseDate = date.getFullYear() + "-" +
              ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
              ("0" + date.getDate()).slice(-2);
          }
          release = currentVersion;
          releaseNum = releaseNum + 1;
          changeLogJSON.releases[releaseNum] = {
            "version": currentVersion,
            "issues": []
          };
        }
        //add issue to release
        changeLogJSON.releases[releaseNum].issues.push({
          "key": currentIssue.key,
          "summary": currentIssue.fields.summary ? currentIssue.fields.summary.replace(/({.*?})/g, "") : "",
          "description": currentIssue.fields.description ? currentIssue.fields.description.replace(/({.*?})/g, "") : "",
          "issuetype": currentIssue.fields.issuetype,
          "status": currentIssue.fields.status,
          "priority": currentIssue.fields.priority,
          "resolution": currentIssue.fields.resolution,
          "components": currentIssue.fields.components,
          "resolutiondate": currentIssue.fields.resolutiondate
        });
      }
      return changeLogJSON;
    }
  };

  return exports;
};
