"use strict";
const R = require("ramda");
const fs = require('fs');
const path = require('path');
const mkdirp = require("mkdirp");
const jiraIssueManager = require("./jiraIssueManager");
const msRestAzure = require("ms-rest-azure");
const ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;
const SubscriptionManagementClient = require('azure-arm-resource').SubscriptionClient;
const WebSiteManagement = require('azure-arm-website');


/**
 * Creates a new authenticated azure client.
 * This is v1: user and password.
 * V2: Use Service Principle.
 * @param {Object} context - context of repository originating the call to this task
 * @param {Function} callback - User Credentials.
 * @throws {Error} Any error that occures during authentication to Azure.
 */
const authenticateAzure = function (context, callback) {
  const azureConfig = require("./config")("azure")[process.env.bamboo_azure_config_code];
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
 * @param {Object} context - context of repository originating the call to this task
 * @param {Object} credentials - User Credentials
 * @param {Function} callback - {Object} User Credentials, {String} Subscription Id.
 * @throws {Error} If a user does not have an assigned subscription.
 */
const getSubscriptionId = function (context, credentials, callback) {
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

  if (R.isNil(jiraIssueKey)) {
    callback(null, credentials, subscriptionId, null);
    return;
  }

  callback(null, credentials, subscriptionId, jiraIssueKey);
  return;
};

/**
 * Validates if a user has access to a resource group, specified in the config file.
 * @param {Object} context - context of repository originating the call to this task
 * @param {Object} credentials - User Credentials
 * @param {String} subscriptionId - Azure subscription id
 * @param {Function} callback - {Object} User Credentials,  {String} Subscription Id
 * @throws {Error} If there no resource group has been specified in the config file.
 * @throws {Error} If a provided user is not a part of any resource group.
 * @throws {Error} If a provided user does not have permissions to access a specified group.
 */
const validateGroupAccess = function (context, credentials, subscriptionId, callback) {
  const azureConfig = require("./config")("azure")[process.env.bamboo_azure_config_code];
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
 * @param {Object} context - context of repository originating the call to this task
 * @param {Object} credentials - User Credentials
 * @param {String} subscriptionId - Azure subscription id
 * @param {String} envName - environment name
 * @param {Function} callback  - {Object} User Credentials,  {String} Subscription Id, {String} Environment Name,
 * {Boolean} True or False value that indicates if an environment already exists.
 */
const checkWebsiteExists = function (context, credentials, subscriptionId, envName, callback) {
  const azureConfig = require("./config")("azure")[process.env.bamboo_azure_config_code];
  if (R.isNil(envName)) {
    callback(null, credentials, subscriptionId, envName, false);
    return;
  }
  const webSiteClient = new WebSiteManagement(credentials, subscriptionId);
  const websiteName = getWebsiteName(azureConfig, envName);
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
 * @param {Object} context - context of repository originating the call to this task
 * @param {Object} credentials - User Credentials
 * @param {String} subscriptionId - Azure subscription id
 * @param {String} envName - environment name
 * @param {Function} callback - nothing
 */
const createEnvironment = function (context, credentials, subscriptionId, envName, callback) {
  createOrUpdateEnvironment(context, credentials, subscriptionId, envName, false, callback);
};
const updateEnvironment = function (context, credentials, subscriptionId, envName, callback) {
  createOrUpdateEnvironment(context, credentials, subscriptionId, envName, true, callback);
};
const createOrUpdateEnvironment = function (context, credentials, subscriptionId, envName, updateMode, callback) {
  const azureConfig = require("./config")("azure")[process.env.bamboo_azure_config_code];
  const logger = context.logger;
  const execUtils = require("../../bin/exec")(logger);
  const webSiteClient = new WebSiteManagement(credentials, subscriptionId);
  const cwd = context.cwd;
  const directories = context.package.directories;
  let azureEnvTemplate = require(path.join(cwd, directories.templates + "/azure-specs", "webapp.json"));

  if (R.isNil(azureEnvTemplate)) {
    callback("Invalid azure environment", envName);
    return;
  }

  //merge siteConfig
  azureEnvTemplate.location = azureConfig.webapp.location;
  azureEnvTemplate.serverFarmId = azureConfig.webapp.serverFarmId;
  azureEnvTemplate.siteConfig = R.merge(azureEnvTemplate.siteConfig, R.clone(azureConfig.webapp.siteConfig));

  const websiteName = getWebsiteName(azureConfig, envName);
  const dbPrimaryConnectionString = getDbPrimaryConnectionString(context);
  azureEnvTemplate.siteConfig.appSettings[0].value = websiteName + ".azurewebsites.net";
  azureEnvTemplate.siteConfig.appSettings[1].value = getDbBackupSchema(context);
  azureEnvTemplate.siteConfig.connectionStrings[0].connectionString = dbPrimaryConnectionString;

  webSiteClient.webApps.createOrUpdate(azureConfig.resource_group, websiteName, azureEnvTemplate)
    .then(
      () => {
        if (updateMode) {
          callback(null, envName);
          return;
        }
        //clone with full username and password to store credential in windows credential manager
        const repositoryPath = getWebsiteSCMURLWithUserAndPass(azureConfig, envName);
        execUtils.cloneFromGitNoLogging(
          repositoryPath,
          "Temp/" + envName,
          context.cwd,
          function cloneCb() {
            callback(null, envName);
          }
        );
      },
      (err) => {
        callback(err, envName);
      }
    );
};

/**
 * Deletes an Azure environment that matches a provided name.
 * @param {Object} context - context of repository originating the call to this task
 * @param {Object} credentials - User Credentials
 * @param {String} subscriptionId - Azure subscription id
 * @param {String} envName - environment name
 * @param {Function} callback - nothing
 */
const deleteEnvironment = function (context, credentials, subscriptionId, envName, callback) {
  const azureConfig = require("./config")("azure")[process.env.bamboo_azure_config_code];
  const webSiteClient = new WebSiteManagement(credentials, subscriptionId);

  const websiteName = getWebsiteName(azureConfig, envName);
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

/**
 * Get the azure environment deployment url.
 * @param {Object} context - context of repository originating the call to this task
 * @returns {String} - deployment url
 */
const getDeploymentUrl = function (context) {
  const jiraIssueKey = jiraIssueManager.getJiraIssueKey(context);
  const azureConfig = require("./config")("azure")[process.env.bamboo_azure_config_code];

  if (R.isNil(jiraIssueKey)) {
    return azureConfig.defaults.webapp_deploy_url;
  }
  return getWebsiteSCMURLWithUser(azureConfig, jiraIssueKey);
};

/**
 * Get the azure environment webapp url.
 * @param {Object} context - context of repository originating the call to this task
 * @returns {String} - webapp url
 */
const getWebappUrl = function (context) {
  const jiraIssueKey = jiraIssueManager.getJiraIssueKey(context);
  const azureConfig = require("./config")("azure")[process.env.bamboo_azure_config_code];

  if (R.isNil(jiraIssueKey)) {
    return azureConfig.defaults.webapp_url;
  }
  const websiteName = getWebsiteName(azureConfig, jiraIssueKey);
  return "https://" + websiteName + ".azurewebsites.net";
};

function getDbPrimarySchema(context) {
  const azureConfig = require("./config")("azure")[process.env.bamboo_azure_config_code];
  const jiraIssueKey = jiraIssueManager.getJiraIssueKey(context);
  let dbSchemaName = azureConfig.defaults.webapp_DbPrimarySchema;
  if (!R.isNil(jiraIssueKey)) {
    dbSchemaName = jiraIssueKey.replace("-", "_").toUpperCase();
  }
  return dbSchemaName;
}

function getDbBackupSchema(context) {
  const azureConfig = require("./config")("azure")[process.env.bamboo_azure_config_code];
  const jiraIssueKey = jiraIssueManager.getJiraIssueKey(context);
  let dbSchemaName = azureConfig.defaults.webapp_DbBackupSchema;
  if (!R.isNil(jiraIssueKey)) {
    dbSchemaName = (jiraIssueKey + "_DAT").replace("-", "_").toUpperCase();
  }
  return dbSchemaName;
}

function getDbPrimaryConnectionString(context, idx) {
  const azureConfig = require("./config")("azure")[process.env.bamboo_azure_config_code];
  return azureConfig.webapp.siteConfig.connectionStrings[R.defaultTo(0, idx)]
    .connectionString.replace("Schema=dbo", "Schema=" + getDbPrimarySchema(context));
}

function getDbBackupConnectionString(context, idx) {
  const azureConfig = require("./config")("azure")[process.env.bamboo_azure_config_code];
  return azureConfig.webapp.siteConfig.connectionStrings[R.defaultTo(0, idx)]
    .connectionString.replace("Schema=dbo", "Schema=" + getDbBackupSchema(context));
}

/**
 * Create a text file containing azure webapp variables for injection into bamboo build plan
 * @param {Object} context - context of repository originating the call to this task
 * @param {Function} callback - nothing
 */
const createAzureWebAppVariablesFile = function (context, callback) {
  const deploymentUrl = getDeploymentUrl(context);
  const webappUrl = getWebappUrl(context);
  const jiraIssueKey = jiraIssueManager.getJiraIssueKey(context);
  mkdirp.sync("Temp");
  fs.writeFile(
    path.join(process.cwd(), "Temp", 'azureWebappVariables.txt'),
    "deploymentUrl=" + deploymentUrl + ".git\n" +
    "webappUrl=" + webappUrl + "\n" +
    "webappPort=443" + "\n" +
    "jiraIssueKey=" + jiraIssueKey + "\n" +
    "webappDbPrimaryConnString0=" + getDbPrimaryConnectionString(context, 0) + "\n" +
    "webappDbBackupConnString0=" + getDbBackupConnectionString(context, 0) + "\n" +
    "webappDbPrimaryConnString1=" + getDbPrimaryConnectionString(context, 1) + "\n" +
    "webappDbBackupConnString1=" + getDbBackupConnectionString(context, 1) + "\n",
    'utf8',
    callback
  );
};

function getWebsiteSCMURLWithUser(azureConfig, envName) {
  const websiteName = getWebsiteName(azureConfig, envName);
  const user = azureConfig.scm_user;
  return "https://" + user + "@" + websiteName + ".scm.azurewebsites.net:443/" + websiteName;
}

function getWebsiteSCMURLWithUserAndPass(azureConfig, envName) {
  const websiteName = getWebsiteName(azureConfig, envName);
  const userAndPass = azureConfig.scm_user + ":" + azureConfig.scm_password;
  return "https://" + userAndPass + "@" + websiteName + ".scm.azurewebsites.net:443/" + websiteName;
}

function getWebsiteName(azureConfig, envName) {
  return (azureConfig.env_prefix + '-' + envName + "-qa").toLowerCase();
}

module.exports = {
  "authenticateAzure": authenticateAzure,
  "checkWebsiteExists": checkWebsiteExists,
  "createEnvironment": createEnvironment,
  "updateEnvironment": updateEnvironment,
  "deleteEnvironment": deleteEnvironment,
  "getSubscriptionId": getSubscriptionId,
  "getEnvironmentName": getEnvironmentName,
  "validateGroupAccess": validateGroupAccess,
  "getDeploymentUrl": getDeploymentUrl,
  "getWebappUrl": getWebappUrl,
  "createAzureWebAppVariablesFile": createAzureWebAppVariablesFile
};
