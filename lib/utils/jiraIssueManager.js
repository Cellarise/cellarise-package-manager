"use strict";

const JiraConnector = require("jira-connector");
const jiraConfig = require("../../lib/utils/config")("jira");
const R = require("ramda");

/**
 * Creates and authenticates a new Jira Connector Client.
 * @param {Function} callback - Jira Oauth Connector Client
 */
const getJiraOauthClient = function (callback) {
  callback(null,
    new JiraConnector({
      "host": jiraConfig.host,
      "oauth": {
        "consumer_key": jiraConfig.oauth.consumer_key,
        "private_key": jiraConfig.oauth.consumer_secret.replace(new RegExp("\\\\n", "g"), "\n"),
        "token": jiraConfig.oauth.access_token,
        "token_secret": jiraConfig.oauth.access_token_secret
      }
    })
  );
};

/**
 * Extracts a Jira issue key from a current bamboo branch name based on a provided regex.
 * This issue key is used to query the current issue state and all related information.
 * @param {Object} context - context of repository originating the call to this task
 * @returns {String} issueKey - jira issue key
 */
const getJiraIssueKey = function (context) {
  const pkg = R.defaultTo({}, context.package);
  const config = R.defaultTo({}, pkg.config);
  const projectCode = R.defaultTo("", config.projectCode);
  const branchName = R.defaultTo("", process.env.bamboo_repository_git_branch);
  const JIRA_ISSUE_KEY_ARR = branchName.match(new RegExp(projectCode + "-\\d*", ""));

  // //look for release branch
  if (branchName.indexOf("release/") > -1) {
    return branchName.replace(new RegExp("[/\\.]", "g"), "-");
  }
  //look for develop branch
  if (branchName.indexOf("develop") > -1) {
    return branchName;
  }
  //look for jira issue key branch
  if (projectCode !== "" && !R.isNil(JIRA_ISSUE_KEY_ARR) && JIRA_ISSUE_KEY_ARR.length > 0) {
    return JIRA_ISSUE_KEY_ARR[0];
  }
  return null;
};

/**
 * Extracts a Jira issue from a current bamboo branch name based on a provided regex.
 * This issue key is used to query the current issue state and all related information.
 * @param {Object} context - context of repository originating the call to this task
 * @param {Object} jiraOauthClient - Jira Oauth Connector Client
 * @param {Function} callback - Jira Issue.
 */
const getJiraIssue = function (context, jiraOauthClient, callback) {
  const JIRA_ISSUE_KEY = getJiraIssueKey(context);

  if (R.isNil(JIRA_ISSUE_KEY) || R.isNil(jiraOauthClient)) {
    callback(null, null);
    return;
  }

  jiraOauthClient.issue.getIssue({
    "issueKey": JIRA_ISSUE_KEY

  }, function (error, issue) {

    if (!R.isEmpty(error) && !R.isNil(error)) {
      callback(null, null);
      return;
    }

    callback(null, issue);
  });
};

/**
 * Analyses components of a supplied issue and extract potential test cases out of them.
 * @param {Object} issue - Jira issue
 * @param {Function} callback - A single or multiple (concatenated) test cases.
 */
const getJiraTestCasesToRun = (issue, callback) => {

  if (R.isNil(issue)) {
    callback(null, null);
    return;
  }

  const components = issue.fields.components;

  if (R.isEmpty(components)) {
    callback(null, null);
    return;
  }

  let componentsNames = '';

  components.forEach((component) => {

    // Replace all spaces and words after last number. Any space before numbers replace with _.
    let currentComponent = component.name.replace(/\s([a-zA-Z])+/g, '').replace(/[\s]+/g, '_');

    if (R.isEmpty(componentsNames)) {
      componentsNames = currentComponent;

    } else {
      componentsNames += ':' + currentComponent;
    }
  });

  callback(null, componentsNames, issue);
};

module.exports = {
  "getJiraOauthClient": getJiraOauthClient,
  "getJiraIssueKey": getJiraIssueKey,
  "getJiraIssue": getJiraIssue,
  "getJiraTestCasesToRun": getJiraTestCasesToRun
};
