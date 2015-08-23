"use strict";

/* Feature: Docs task: Generate Readme file from doc templates */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var path = require("path");
  var fs = require("fs");

  return English.library()
    /*Scenario: Generate Readme file from doc templates pre-configured by docs-pre task */
    .define("Then docs expected documentation is produced", function test(done) {
      assert.equal(
        fs.readFileSync(path.join(this.world.dir, "README.md")).toString(),
        fs.readFileSync(path.join(process.cwd(), "Test_Resources/README.md")).toString());
      done();
    });
})();
