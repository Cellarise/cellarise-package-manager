"use strict";

/* Feature: Dependency task: Add David dependency check task */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var path = require("path");
  var fs = require("fs");

  return English.library()
    /*Scenario: Check test package dependencies pass */
    .define("Given the Cellarise/cellarise-package-manager package manifest", function test(done) {
      this.world.dir = path.join(__dirname, "../../../..");
      this.world.pkg = require(path.join(__dirname, "../../../..", "package.json"));
      done();
    })
    .define("Then the david report passes", function test(done) {
      var reportPath = path.join(__dirname, "../../../../Reports", "david-mocha-tests.json");
      var report = JSON.parse(fs.readFileSync(reportPath)); //get fresh from file system
      assert.equal(0, report.stats.failures);
      done();
    })
    /*Scenario: Check test package dependencies fails */
    .define("Given a package manifest with out of date dependencies", function test(done) {
      this.world.dir = path.join(__dirname, "../../../..");
      this.world.pkgPath = path.join(__dirname, "../../../..", "package.json");
      this.world.pkg = require(this.world.pkgPath);
      this.world.savedCurrentDependency = this.world.pkg.optionalDependencies.through2;

      //write updated package
      this.world.pkg.optionalDependencies.through2 = "^0.6.1";
      fs.writeFile(this.world.pkgPath, JSON.stringify(this.world.pkg, null, 2), null, done);
    })
    .define("Then the david report fails", function test(done) {
      var reportPath = path.join(__dirname, "../../../../Reports", "david-mocha-tests.json");
      var report = JSON.parse(fs.readFileSync(reportPath)); //get fresh from file system
      assert.equal(1, report.stats.failures);

      //write original package
      this.world.pkg.optionalDependencies.through2 = this.world.savedCurrentDependency;
      //Need to perform this write synchronously to prevent windows file write issue!
      fs.writeFile(this.world.pkgPath, JSON.stringify(this.world.pkg, null, 2), null, done);
    });
})();
