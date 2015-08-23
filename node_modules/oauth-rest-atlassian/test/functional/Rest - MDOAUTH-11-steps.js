"use strict";

var config;
if (process.env.hasOwnProperty("bamboo_oauth_config_path")) {
  config = require(process.env.bamboo_oauth_config_path);
} else {
  config = require("../../config.json");
}

/* Feature: Rest: Add post, put and delete methods to rest function */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var rest = require("../..").rest;
  return English.library()
    /*Scenario: JIRA POST rest query */
    .define("When I perform a post create operation", function test(done) {
      var self = this;
      var jiraQuery = "issue";
      rest({
          "config": config.applications.jira,
          "query": jiraQuery,
          "method": "post",
          "postData": {
            "fields": {
              "project": {
                "key": "MDTEST"
              },
              "summary": "test",
              "issuetype": {
                "name": "Feature"
              }
            }
          }
        },
        function restCallback(error, data) {
          assert(!error);
          self.world.newIssue = data;
          done();
        });
    })
    .define("Then a new issue is created", function test(done) {
      assert(this.world.newIssue);
      done();
    })/*Scenario: JIRA PUT rest query */
    .define("When I perform a put update operation", function test(done) {
      var jiraQuery = "issue/" + this.world.newIssue.key;
      rest({
          "config": config.applications.jira,
          "query": jiraQuery,
          "method": "put",
          "postData": {
            "fields": {
              "summary": "test-update"
            }
          }
        },
        function restCallback(error) {
          assert(!error);
          done();
        });
    })
    .define("Then expected update is performed", function test(done) {
      var jiraQuery = "search?jql=(issue=" + this.world.newIssue.key + ")";
      rest({
          "config": config.applications.jira,
          "query": jiraQuery
        },
        function restCallback(error, data) {
          assert(!error);
          assert.equal(data.issues[0].fields.summary, "test-update");
          done();
        });
    })
    .define("When I perform a transition operation", function test(done) {
      var jiraQuery = "issue/" + this.world.newIssue.key + "/transitions";
      rest({
          "config": config.applications.jira,
          "query": jiraQuery,
          "method": "post",
          "postData": {
            "transition": {
              "id": "11" //transition issue to in-progress "11"
            }
          }
        },
        function restCallback(error) {
          assert(!error);
          done();
        });
    })
    .define("Then expected transition is performed", function test(done) {
      assert(true);
      done();
    })
    /*Scenario: JIRA DELETE rest query */
    .define("When I perform a delete operation", function test(done) {
      var jiraQuery = "issue/" + this.world.newIssue.key;
      rest({
          "config": config.applications.jira,
          "query": jiraQuery,
          "method": "delete"
        },
        function restCallback(error) {
          assert(!error);
          done();
        });
    })
    .define("Then expected delete is performed", function test(done) {
      assert(true);
      done();
    });
})();
