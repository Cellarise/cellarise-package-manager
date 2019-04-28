"use strict";
const R = require("ramda");
const azureConfig = require("./config")("azure");
const jiraIssueManager = require("./jiraIssueManager");
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
const authenticateAzure = function (callback) {
  msRestAzure.loginWithServicePrincipalSecret(
    azureConfig.client_id,
    azureConfig.secret,
    azureConfig.tenant_id,
    (error, credentials) => {

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
const getSubscriptionId = function (credentials, callback) {
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
 * @param {Object} context - context of repository originating the call to this task
 * @param {Object} credentials - User Credentials
 * @param {String} subscriptionId - Azure subscription id
 * @param {Function} callback - {Object} User Credentials,  {String} Subscription Id, {String} Environment Name.
 */
const getEnvironmentName = function (context, credentials, subscriptionId, callback) {
  const jiraIssueKey = jiraIssueManager.getJiraIssueKey(context);

  if (R.isEmpty(jiraIssueKey) || R.isNil(jiraIssueKey)) {
    callback(null, credentials, subscriptionId, null);
    return;
  }

  callback(null, credentials, subscriptionId, jiraIssueKey);
  return;
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
const validateGroupAccess = function (credentials, subscriptionId, callback) {
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
const checkWebsiteExists = function (credentials, subscriptionId, envName, callback) {
  if (R.isNil(envName)) {
    callback(null, credentials, subscriptionId, envName, false);
    return;
  }
  const webSiteClient = new WebSiteManagement(credentials, subscriptionId);
  const websiteName = getWebsiteName(envName);
  webSiteClient.checkNameAvailability(websiteName, azureConfig.resource_type).then(
    (res) => {
      callback(null, credentials, subscriptionId, envName, !res.nameAvailable);
    },
    (err) => {
      callback(err);
    }
  );
};

/**
 * Creates an Azure environment with a provided name.
 * This is V1: Template is hard-coded.
 * @param {Object} credentials - User Credentials
 * @param {String} subscriptionId - Azure subscription id
 * @param {String} envName - environment name
 * @param {Function} callback - nothing
 */
const createEnvironment = function (credentials, subscriptionId, envName, callback) {
  const webSiteClient = new WebSiteManagement(credentials, subscriptionId);
  const azureEnvTemplate = require("../../azureEnvTemplate");

  if (R.isNil(azureEnvTemplate)) {
    callback("Invalid azure environment");
    return;
  }

  const websiteName = getWebsiteName(envName);
  azureEnvTemplate.siteConfig.appSettings[0].value = websiteName + ".azurewebsites.net";
  const dbSchemaName = getDbSchemaName(envName);
  azureEnvTemplate.siteConfig.connectionStrings[0].connectionString = azureEnvTemplate.siteConfig.connectionStrings[0]
    .connectionString.replace("Schema=dbo", "Schema=" + dbSchemaName);

  webSiteClient.webApps.createOrUpdate(azureConfig.resource_group, websiteName, azureEnvTemplate)
    .then(
      () => {
        callback();
      },
      (err) => {
        callback(err);
      }
    );
};

/**
 * Deletes an Azure environment that matches a provided name.
 * @param {Object} credentials - User Credentials
 * @param {String} subscriptionId - Azure subscription id
 * @param {String} envName - environment name
 * @param {Function} callback - nothing
 */
const deleteEnvironment = function (credentials, subscriptionId, envName, callback) {
  const webSiteClient = new WebSiteManagement(credentials, subscriptionId);

  const websiteName = getWebsiteName(envName);
  webSiteClient.webApps.deleteMethod(azureConfig.resource_group, websiteName, {
    "deleteMetrics": true

  }).then(() => {
      callback();
    },
    (err) => {
      callback(err);
    }
  );
};

function getDbSchemaName(envName) {
  return envName.replace("-", "_").toUpperCase();
}

function getWebsiteName(envName) {
  return (azureConfig.env_prefix + '-' + envName).toLowerCase();
}

module.exports = {
  "authenticateAzure": authenticateAzure,
  "checkWebsiteExists": checkWebsiteExists,
  "createEnvironment": createEnvironment,
  "deleteEnvironment": deleteEnvironment,
  "getSubscriptionId": getSubscriptionId,
  "getEnvironmentName": getEnvironmentName,
  "validateGroupAccess": validateGroupAccess
};
