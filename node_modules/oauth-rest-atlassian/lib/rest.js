"use strict";
var OAuth = require("./oauth").OAuth;
var _ = require("underscore");

/**
 * Execute a rest query using the http GET, POST, PUT or DELETE method
 * @module rest
 * @param {Object} opts - required options
 * @param {Object} [opts.config] - the configuration object which must contain the following properties:
 * config.protocol - the protocol of the JIRA server (http/https)
 * config.host - the host address of the JIRA server
 * config.port - the port of the JIRA server
 * config.paths["request-token"] - the oauth request-token
 * config.paths["access-token"] - the oauth access-token
 * config.oauth.consumer_key - the oauth consumer key
 * config.oauth.consumer_secret - the oauth consumer secret
 * @param {Object} [opts.query] - the rest query url
 * @param {Object} [opts.method="get"] - optional the http method - one of get, post, put, delete
 * @param {Object} [opts.postData=""] - optional the post data for create or update queries.
 * @param {Function} cb - the callback function called once the search has completed.
 * The callback function must have the following signature: done(error, data).
 * - error - an error object returned by oauth
 * - data - the data returned as a JSON object
 */
module.exports = function oauthRest(opts, cb) {
  //check options
  var config = opts.config;
  var query = opts.query;
  var method = opts.method || "get";
  var postData = opts.postData || "";
  var basePath;
  var consumer;

  var parsePostData = function parsePostData(data) {
    var parsedData = data;
    if (_.isString(data)) {
      try {
        parsedData = JSON.parse(data);
      } catch (err) {
        parsedData = data;
      }
    }
    return parsedData;
  };

  //ensure required properties are available in config.json and search jql provided
  if (config.protocol && config.host && config.port && query) {
    basePath = config.protocol + "://" + config.host + ":" + config.port;

    //oauth consumer object
    consumer =
      new OAuth(
          basePath + config.paths["request-token"],
          basePath + config.paths["access-token"],
        config.oauth.consumer_key,
        config.oauth.consumer_secret,
        "1.0",
        null,
        "RSA-SHA1");

    if (method === "post" || method === "put") {
      //get
      consumer[method](basePath + "/rest/api/latest/" + query,
        config.oauth.access_token,
        config.oauth.access_token_secret,
        postData,
        "application/json",
        function consumerCallback(error, data) {
          cb(error, parsePostData(data));
        });
    } else {
      //get
      consumer[method](basePath + "/rest/api/latest/" + query,
        config.oauth.access_token,
        config.oauth.access_token_secret,
        function consumerCallback(error, data) {
          cb(error, parsePostData(data));
        });
    }
  } else {
    cb("Oauth-rest-atlassian: Invalid options.");
  }
};
