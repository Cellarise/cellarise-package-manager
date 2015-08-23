"use strict";
/**
 * Application configuration utility
 * @exports utils/config
 * @param {String} application - application
 * @returns {Object} configuration for application
 */
module.exports = function configUtils(application) {
  var path = require("path");
  var fs = require("fs");
  var config = {};
  var configPath = path.resolve(__dirname, "../..") + "/config.json";
  var defaultConfigPath = path.resolve(__dirname, "../..") + "/defaultConfig.json";
  //check if the oauth config file exists
  if (fs.existsSync(configPath)) {
    config = require(configPath).applications[application];
  } else if (process.env.hasOwnProperty("bamboo_oauth_config_path")) {
    config = require(process.env.bamboo_oauth_config_path).applications[application];
  } else if (process.env.CI) {
    config = require(defaultConfigPath).applications[application];
    /*eslint camelcase:0 no-console:0*/
    console.log("Using default config and keys from CI environment");
    config.consumer_key = process.env.consumer_key;
    config.consumer_secret = process.env[application + '_consumer_secret'];
    config.access_token = process.env[application + '_access_token'];
    config.access_token_secret = process.env[application + '_access_token_secret'];
  }
  return config;
};
