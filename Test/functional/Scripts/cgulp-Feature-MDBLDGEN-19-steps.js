"use strict";

/* Feature: cgulp: Automate creation of package.json where it doesn"t already exist. */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  return English.library()
    /*Scenario:  */
    .define("When executing cgulp null task", function test(done) {
      var path = require("path");
      var exec = require(path.join(__dirname, "../../../bin/exec"))(this.world.logger);
      exec.runGulpTask("null", this.world.dir, function cb(err) {
        assert(!err);
        done();
      });
    })
    .define("Then no errors are returned", function test(done) {
      assert(true);
      done();
    });
})();
