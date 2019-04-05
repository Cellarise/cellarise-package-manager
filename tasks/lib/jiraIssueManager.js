"use strict";

const jiraConnector = require("jira-connector");
const jiraConfig = require("../../lib/utils/config")("jira");
const R = require("ramda");

/**
 * Creates and authenticates a new Jira Connector Client. 
 * @param {Function} callback 
 * @returns {Object} Authenticated Jira Client.
 */
const getJiraOauthClient = function(callback) {
    callback(null, 
      new jiraConnector({
        host: jiraConfig.host,
        oauth: {
          consumer_key: jiraConfig.oauth.consumer_key,
          private_key: jiraConfig.oauth.consumer_secret.replace(new RegExp("\\\\n", "\g"), "\n"),
          token: jiraConfig.oauth.access_token,
          token_secret: jiraConfig.oauth.access_token_secret
        }
      })
    ); 
};

/**
 * Extracts a Jira issue key from a current bamboo branch name based on a provided regex.
 * This issue key is used to query the current issue state and all related information. 
 * @param {Object} jiraOauthClient 
 * @param {Function} callback 
 * @returns {Object} Jira Issue.
 */
const getJiraIssue = function(jiraOauthClient, callback) {
    const jiraIssueKey = process.env.bamboo_repository_git_branch.match(new RegExp(jiraConfig.stories.regex, "g"));
    
    if (R.isEmpty(jiraIssueKey) || R.isNil(jiraIssueKey) || R.isNil(jiraOauthClient)) {
        callback(null, null);
        return;
    }
    
    jiraOauthClient.issue.getIssue({
        issueKey: jiraIssueKey
    
    }, function(error, issue) {
    
        if (!R.isEmpty(error) && !R.isNil(error)) {
            callback(error);
            return;
        }
    
        callback(null, issue);
    });
};

/**
 * Analyses components of a supplied issue and extract potential test cases out of them.
 * @param {Object} issue 
 * @param {Function} callback 
 * @returns {String} A single or multiple (concatenated) test cases.
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
        let currentComponent = component.name.replace(/\s([a-zA-Z])+/g, '').replace(/[\s]+/g,'_');
        
        if (R.isEmpty(componentsNames)) {
            componentsNames = currentComponent;
        
        } else {
            componentsNames += ':' + currentComponent;
        }
    });
    
    callback(null, componentsNames);
};

module.exports = {
    getJiraOauthClient: getJiraOauthClient,
    getJiraIssue: getJiraIssue,
    getJiraTestCasesToRun: getJiraTestCasesToRun
};