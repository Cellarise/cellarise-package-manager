"use strict";
var config;
if (process.env.hasOwnProperty("bamboo_oauth_config_path")) {
  config = require(process.env.bamboo_oauth_config_path);
} else {
  config = require("../../config.json");
}
/* Feature: OAuth authorisation dance */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var OAuth = require("../..").OAuth;
  return English.library()
    /*Scenario: JIRA authorisation */
    .define("Given I have an access token for my JIRA server", function test(done) {
      var appConfig = config.applications.jira;
      var basePath = appConfig.protocol + "://" + appConfig.host + ":" + appConfig.port;
      this.world.appConfig = appConfig;
      this.world.basePath = basePath;
      //oauth consumer object
      this.world.consumer =
        new OAuth(
            basePath + appConfig.paths["request-token"],
            basePath + appConfig.paths["access-token"],
          appConfig.oauth.consumer_key,
          appConfig.oauth.consumer_secret,
          "1.0",
          "https://localhost/callback/",
          "RSA-SHA1");
      done();
    })
    .define("When I perform the get issue operation on $issue", function test(issue, done) {
      var self = this;
      this.world.consumer.get(this.world.basePath + "/rest/api/latest/issue/" + issue,
        this.world.appConfig.oauth.access_token,
        this.world.appConfig.oauth.access_token_secret,
        function (error, data) {
          self.world.data = JSON.parse(data);
          done();
        });
    })
    .define("Then issue $issue is returned", function test(issue, done) {
      assert.equal(this.world.data.key, issue);
      done();
    });
})();
