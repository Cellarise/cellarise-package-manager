"use strict";

const R = require("ramda");
const azureConfig = require("./config")("azure");
const jiraConfig = require("./config")("jira");

const msRestAzure = require("ms-rest-azure");
const resourceManagementClient = require('azure-arm-resource').ResourceManagementClient;
const subscriptionManagementClient = require('azure-arm-resource').SubscriptionClient;

/**
 * Creates a new authenticated azure client.
 * This is v1: user and password.
 * V2: Use Service Principle. 
 * @param {Function} callback 
 * @returns {Object} User Credentials.
 * @throws {Error} Any error that occures during authentication to Azure. 
 */
const authenticateAzure = function(callback) { 
    msRestAzure.loginWithUsernamePassword(azureConfig.user, azureConfig.password, (error, credentials) => {
  
      if (!R.isEmpty(error) && !R.isNil(error)) {
        callback(error);
        return;
      }
  
      callback(null, credentials);
    });
  };
  
/**
 * Retrieves a subscription id (if any) for provided credentials.
 * @param {Object} credentials 
 * @param {Function} callback 
 * @returns {Object} User Credentials.
 * @returns {String} Subscription Id.
 * @throws {Error} If a user does not have an assigned subscription.
 */
const getSubscriptionId = function(credentials, callback) {
    const subscriptionClient = new subscriptionManagementClient(credentials);

    subscriptionClient.subscriptions.list().then((res) => {
      const subscription_id = res[0].subscriptionId;
  
      if (R.isNil(subscription_id) || R.isEmpty(subscription_id)) {
        callback("No subscriptions available for this user.");
        return;
      }
  
      callback(null, credentials, subscription_id);
    });
  };

  /**
   * Extracts a Jira issue key from a current bamboo branch 
   * and prepends a prefix, specified in the config file. 
   * @param {Object} credentials 
   * @param {String} subscription_id 
   * @param {Function} callback 
   * @returns {Object} User Credentials.
   * @returns {String} Subscription Id.
   * @returns {String} Environment Name.
   */
const getEnvironmentName = function(credentials, subscription_id, callback) {
    const jiraIssueKey = process.env.bamboo_repository_git_branch.match(new RegExp(jiraConfig.stories.regex, "g"));
    
    if (R.isEmpty(jiraIssueKey) || R.isNil(jiraIssueKey)) {
        callback(null, credentials, subscription_id);
        return;
    }
  
    callback(null, 
      credentials,
      subscription_id,
      R.isEmpty(azureConfig.env_prefix) 
        ? jiraIssueKey 
        : azureConfig.env_prefix + '-' + jiraIssueKey
    );
  };
  
/**
 * Validates if a user has access to a resource group, specified in the config file.
 * @param {Object} credentials 
 * @param {String} subscription_id 
 * @param {Function} callback
 * @throws {Error} If there no resource group has been specified in the config file.
 * @throws {Error} If a provided user is not a part of any resource group.
 * @throws {Error} If a provided user does not have permissions to access a specified group.
 */
const validateGroupAccess = function(credentials, subscription_id, callback) {
    const resourceClient = new resourceManagementClient(credentials, subscription_id);
  
    if (R.isNil(azureConfig.resource_group) || R.isEmpty(azureConfig.resource_group)) {
      callback("No resource_group has been specified in your config file.");
      return;
    }

    resourceClient.resourceGroups.list().then((groups) => {
      let group_id = null;
  
      if (R.isNil(groups) || R.isEmpty(groups)) {
        callback("No groups available for this user.");
        return;
      }
  
      group_id = groups.filter((group) => group.name === azureConfig.resource_group);
  
      if (R.isNil(group_id) || R.isEmpty(group_id)) {
        callback("This user doesn't have access to the specified group.");
        return;
      }
  
      callback(null, credentials, subscription_id);
    });
  };

module.exports = {
  authenticateAzure: authenticateAzure,
  getSubscriptionId: getSubscriptionId,
  getEnvironmentName: getEnvironmentName,
  validateGroupAccess: validateGroupAccess
};