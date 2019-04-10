"use strict";

const R = require("ramda");
const azureConfig = require("../../lib/utils/config")("azure");
const jiraConfig = require("../../lib/utils/config")("jira");

const msRestAzure = require("ms-rest-azure");
const ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;
const SubscriptionManagementClient = require('azure-arm-resource').SubscriptionClient;
const WebSiteManagement = require('azure-arm-website');

/**
 * Creates a new authenticated azure client.
 * This is v1: user and password.
 * V2: Use Service Principle.
 * @param {Function} callback - User Credentials.
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
 * @param {Object} credentials - User Credentials
 * @param {Function} callback - {Object} User Credentials, {String} Subscription Id.
 * @throws {Error} If a user does not have an assigned subscription.
 */
const getSubscriptionId = function(credentials, callback) {
    const subscriptionClient = new SubscriptionManagementClient(credentials);

    subscriptionClient.subscriptions.list().then((res) => {
      const subscriptionId = res[0].subscriptionId;

      if (R.isNil(subscriptionId) || R.isEmpty(subscriptionId)) {
        callback("No subscriptions available for this user.");
        return;
      }

      callback(null, credentials, subscriptionId);
    });
  };

  /**
   * Extracts a Jira issue key from a current bamboo branch
   * and prepends a prefix, specified in the config file.
   * @param {Object} credentials - User Credentials
   * @param {String} subscriptionId - Azure subscription id
   * @param {Function} callback - {Object} User Credentials,  {String} Subscription Id, {String} Environment Name.
   */
const getEnvironmentName = function(credentials, subscriptionId, callback) {
    const jiraIssueKey = process.env.bamboo_repository_git_branch.match(new RegExp(jiraConfig.stories.regex, "g"));

    if (R.isEmpty(jiraIssueKey) || R.isNil(jiraIssueKey)) {
        callback(null, credentials, subscriptionId);
        return;
    }

    const name = R.isEmpty(azureConfig.env_prefix) ? jiraIssueKey : azureConfig.env_prefix + '-' + jiraIssueKey;
    callback(null, credentials, subscriptionId, name.toLowerCase());
  };

/**
 * Validates if a user has access to a resource group, specified in the config file.
 * @param {Object} credentials - User Credentials
 * @param {String} subscriptionId - Azure subscription id
 * @param {Function} callback - {Object} User Credentials,  {String} Subscription Id
 * @throws {Error} If there no resource group has been specified in the config file.
 * @throws {Error} If a provided user is not a part of any resource group.
 * @throws {Error} If a provided user does not have permissions to access a specified group.
 */
const validateGroupAccess = function(credentials, subscriptionId, callback) {
    const resourceClient = new ResourceManagementClient(credentials, subscriptionId);

    if (R.isNil(azureConfig.resource_group) || R.isEmpty(azureConfig.resource_group)) {
      callback("No resource_group has been specified in your config file.");
      return;
    }

    resourceClient.resourceGroups.list().then((groups) => {
      let groupId = null;

      if (R.isNil(groups) || R.isEmpty(groups)) {
        callback("No groups available for this user.");
        return;
      }

      groupId = groups.filter((group) => group.name === azureConfig.resource_group);

      if (R.isNil(groupId) || R.isEmpty(groupId)) {
        callback("This user doesn't have access to the specified group.");
        return;
      }

      callback(null, credentials, subscriptionId);
    });
  };

/**
 * Checks if an environment already exists.
 * @param {Object} credentials - User Credentials
 * @param {String} subscriptionId - Azure subscription id
 * @param {String} envName - environment name
 * @param {Function} callback  - {Object} User Credentials,  {String} Subscription Id, {String} Environment Name,
 * {Boolean} True or False value that indicates if an environment already exists.
 */
const checkWebsiteExists = function(credentials, subscriptionId, envName, callback) {
  const webSiteClient = new WebSiteManagement(credentials, subscriptionId);

  webSiteClient.checkNameAvailability(envName, azureConfig.resource_type).then((res) => {
    callback(null, credentials, subscriptionId, envName, !res.nameAvailable);
  });
};

/**
 * Creates an Azure environment with a provided name.
 * This is V1: Template is hard-coded.
 * @param {Object} credentials - User Credentials
 * @param {String} subscriptionId - Azure subscription id
 * @param {String} envName - environment name
 * @param {String} azureEnvTemplate - Deployment template for WebApps
 * @param {Function} callback - nothing
 */
const createEnvironment = function(credentials, subscriptionId, envName, azureEnvTemplate, callback) {
  const webSiteClient = new WebSiteManagement(credentials, subscriptionId);

  webSiteClient.webApps.createOrUpdate(azureConfig.resource_group, envName, azureEnvTemplate).then(() => {
    callback();
  });
};

/**
 * Deletes an Azure environment that matches a provided name.
 * @param {Object} credentials - User Credentials
 * @param {String} subscriptionId - Azure subscription id
 * @param {String} envName - environment name
 * @param {Function} callback - nothing
 */
const deleteEnvironment = function(credentials, subscriptionId, envName, callback) {
  const webSiteClient = new WebSiteManagement(credentials, subscriptionId);

  webSiteClient.webApps.deleteMethod(azureConfig.resource_group, envName, {
    "deleteMetrics": true

  }).then(() => {
    callback();
  });
};

module.exports = {
  "authenticateAzure": authenticateAzure,
  "checkWebsiteExists": checkWebsiteExists,
  "createEnvironment": createEnvironment,
  "deleteEnvironment": deleteEnvironment,
  "getSubscriptionId": getSubscriptionId,
  "getEnvironmentName": getEnvironmentName,
  "validateGroupAccess": validateGroupAccess
};
