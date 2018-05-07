"use strict";

/* Feature: Scaffold task: Add function to copy standard templates and files into a package */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  var path = require("path");

  return English.library()
    /*Scenario: Scaffold new package */
    .define("Given $dir is empty", function test(dir, done) {
      var mkdirp = require("mkdirp");
      var testDir = process.cwd() + path.sep + dir;
      var glob = require("glob");
      var exec = require(path.join(__dirname, "../../../bin/exec"))(this.world.logger);
      var self = this;

      this.world.dir = testDir;
      this.world.after = function afterScenario(done1) {
        if (path.relative(process.cwd(), self.world.dir) !== ""){
          //done1();
          require(path.join(__dirname, "./Task-utils"))().clearFolders([self.world.dir], done1);
        } else {
          done1();
        }
      };
      //remove pre-existing instance of folder and create clean
      exec.clearFolder(this.world.dir, function cb(err) {
        mkdirp.sync(testDir);
        assert(!err);
        assert(glob.sync(testDir + "/**/*").length === 0);
        done();
      });
    })
    .define("(?:When executing|And executed) $task", function test(task, done) {
      var exec = require(path.join(__dirname, "../../../bin/exec"))(this.world.logger);
      exec.runGulpTask(task, this.world.dir, done);
    })
    .define("And the test package is loaded into the directory", function test(done) {
      var testDir = this.world.dir;
      var exec = require(path.join(__dirname, "../../../bin/exec"))(this.world.logger);
      //clone project from git
      exec.cloneFromGit("https://github.com/Cellarise/test",
        path.basename(testDir),
        null,
        function cloneFromGitCallback(err, stdout) {
          done(err, stdout);
        });
    });
})();
