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
  //check if the oauth config file exists
  if (fs.existsSync(configPath)) {
    config = require(configPath).applications[application];
  } else if (process.env.hasOwnProperty("bamboo_oauth_config_path")) {
    config = require(process.env.bamboo_oauth_config_path).applications[application];
  }
  return config;
};
