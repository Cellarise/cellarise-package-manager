"use strict";

/* Feature: Package task: Update task to allow creation of Build folder based on contents in folder pub-build */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var path = require("path");
  var fs = require("fs");
  return English.library()
    /*Scenario: Package build files for deployment */
    .define("Then the expected build package is produced", function test(done) {
      assert.equal(
        fs.readFileSync(path.join(process.cwd(), "Test_Resources", "README.md")).toString(),
        fs.readFileSync(path.join(process.cwd(), this.world.dir, "Build", "README.md")).toString());

      done();
    });
})();
