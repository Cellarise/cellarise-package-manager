"use strict";

/* Feature: Docs-pre task: Add a gulp task to generate a change log from JIRA fix versions. */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var path = require("path");
  var fs = require("fs");

  return English.library()
    /*Scenario: Change log */
    .define("Then expected documentation is produced", function test(done) {
      assert.equal(
        fs.readFileSync(path.join(this.world.dir, "doc/readme-changelog.md")).toString(),
        fs.readFileSync(path.join(process.cwd(), "Test_Resources/doc/readme-changelog.md")).toString());
      done();
    });
})();
