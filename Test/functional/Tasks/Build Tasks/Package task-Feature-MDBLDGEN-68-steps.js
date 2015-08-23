"use strict";

/* Feature: Package task: Update task to allow creation of Build folder based on contents in folder pub-build */
module.exports = (function testSuite() {
    var English = require("yadda").localisation.English;
    var assert = require("assert");
    var path = require("path");
    return English.library()
        /*Scenario: Package build files for deployment */
        .define("Then the expected build package is produced", function test(done) {
            var ndd = require("node-dir-diff");
            var expectedBuild = path.join(process.cwd(), "Test_Resources", "Build");
            var actualBuild = path.join(process.cwd(), this.world.dir, "Build");

            var dd = new ndd.Dir_Diff(
                [
                    expectedBuild,
                    actualBuild
                ],
                "full");

            dd.compare(function ddCompare(err, result){
                assert(!err);
                assert(result.file_status[0].deviation === 0);
                assert(result.missing.length === 0);
                done();
            });
        });
})();
