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
        fs.readFileSync(path.join(this.world.dir, "README.md")).toString(),
        fs.readFileSync(path.join(this.world.dir, "Build", "README.md")).toString());
      assert.equal(
        fs.readFileSync(path.join(this.world.dir, "lib/index.js")).toString(),
        fs.readFileSync(path.join(this.world.dir, "Build", "lib/index.js")).toString());
      assert.equal(
        fs.readFileSync(path.join(this.world.dir, "tasks/default.js")).toString(),
        fs.readFileSync(path.join(this.world.dir, "Build", "tasks/default.js")).toString());
      assert.equal(
        fs.readFileSync(path.join(this.world.dir, "Test/test.js")).toString(),
        fs.readFileSync(path.join(this.world.dir, "Build", "Test/test.js")).toString());
      done();
    });
})();
