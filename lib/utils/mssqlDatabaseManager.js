"use strict";
const R = require("ramda");
const vasync = require("vasync");
const sql = require('mssql');
const jiraIssueManager = require("./jiraIssueManager");


function deleteAllWebappDatabaseSchemaAndData(context, callback) {
  vasync.pipeline({
    'funcs': [
      function f1(_, cb) {
        deleteWebappDatabaseSchemaAndData(context, getDbPrimaryConnectionString(context, 0), cb);
      },
      function f2(_, cb) {
        deleteWebappDatabaseSchemaAndData(context, getDbPrimaryConnectionString(context, 1), cb);
      },
      function f3(_, cb) {
        deleteWebappDatabaseSchemaAndData(context, getDbBackupConnectionString(context, 0), cb);
      },
      function f4(_, cb) {
        deleteWebappDatabaseSchemaAndData(context, getDbBackupConnectionString(context, 1), cb);
      }
    ]
  }, function end(err) {
    callback(err);
  });
}


function deleteWebappDatabaseSchemaAndData(context, connStr, callback) {
  const logger = context.logger;
  const connectionObject = R.pipe(
    R.split(";"),
    R.map(R.split("=")),
    R.fromPairs()
  )(connStr);
  const dbConfig = {
    "requestTimeout": 60000,
    "options": {
      "encrypt": true // Use this if you're on Windows Azure
    },
    "server": connectionObject["Data Source"].split(":")[1].split(",")[0],
    "port": 1433,
    "schema": connectionObject.Schema,
    "database": connectionObject["Initial Catalog"],
    "user": connectionObject.hasOwnProperty("User Id")
      ? connectionObject["User Id"]
      : connectionObject["User ID"],
    "password": connectionObject.Password
  };
  sql.connect(dbConfig)
    .then(() => {
      logger.info("Remove sys versioning from tables in schema: " + connectionObject.Schema);
      return new sql.Request()
        .input('schemaName', sql.VarChar(50), connectionObject.Schema) //eslint-disable-line
        .execute('Remove_SysVer_From_Tables');
    })
    .then(() => {
      logger.info("Dropping tables for schema: " + connectionObject.Schema);
      return new sql.Request()
        .input('schemaName', sql.VarChar(50), connectionObject.Schema) //eslint-disable-line
        .execute('Drop_Tables');
    })
    .then(() => {
      logger.info("Dropping schema: " + connectionObject.Schema);
      return new sql.Request()
        .query('DROP SCHEMA [' + connectionObject.Schema + ']');
    })
    .then(() => {
      sql.close();
      callback();
    })
    .catch(function cb(err) {
      callback(err);
    });
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


function getDbPrimarySchema(context) {
  const jiraIssueKey = jiraIssueManager.getJiraIssueKey(context);
  let dbSchemaName = "dbo";
  if (!R.isNil(jiraIssueKey)) {
    dbSchemaName = jiraIssueKey.replace("-", "_").toUpperCase();
  }
  return dbSchemaName;
}

function getDbBackupSchema(context) {
  const jiraIssueKey = jiraIssueManager.getJiraIssueKey(context);
  let dbSchemaName = "NHVR_DAT";
  if (!R.isNil(jiraIssueKey)) {
    dbSchemaName = (jiraIssueKey + "_DAT").replace(new RegExp("\\-", "g"), "_").toUpperCase();
  }
  return dbSchemaName;
}


module.exports = {
  "getDbPrimaryConnectionString": getDbPrimaryConnectionString,
  "getDbBackupConnectionString": getDbBackupConnectionString,
  "getDbPrimarySchema": getDbPrimarySchema,
  "getDbBackupSchema": getDbBackupSchema,
  "deleteAllWebappDatabaseSchemaAndData": deleteAllWebappDatabaseSchemaAndData
};
