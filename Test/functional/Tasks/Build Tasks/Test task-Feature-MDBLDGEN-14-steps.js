"use strict";

/* Feature: Test task: Update unit test step to save output report with "mocha" in the filename. */
module.exports = (function testSuite() {
    var English = require("yadda").localisation.English;
    var assert = require("assert");
    var path = require("path");
    var fs = require("fs");

    return English.library()
        /*Scenario: Run tests with coverage */
        .define("Then the expected test report documentation is produced", function test(done) {
            var _ = require("underscore");
            //omit time sensitive entries from *mocha-tests
            var actualTestReport = JSON.parse(fs.readFileSync(path.join(this.world.dir,
                "Reports/unit-mocha-tests.json")).toString());
            var expectedTestReport = JSON.parse(fs.readFileSync(path.join(process.cwd(),
                "Test_Resources/Reports/unit-mocha-tests.json")).toString());

            actualTestReport = JSON.stringify(_.omit(actualTestReport.stats, ["duration", "start", "end"]));
            expectedTestReport = JSON.stringify(_.omit(expectedTestReport.stats, ["duration", "start", "end"]));

            assert.equal(actualTestReport, expectedTestReport);

            //coverage report
            actualTestReport = JSON.parse(fs.readFileSync(path.join(this.world.dir,
                "Reports/code-coverage/clover-tests.json")).toString());
            expectedTestReport = JSON.parse(fs.readFileSync(path.join(process.cwd(),
                "Test_Resources/Reports/code-coverage/clover-tests.json")).toString());
            actualTestReport = JSON.stringify(_.omit(actualTestReport.stats, ["duration", "start", "end"]));
            expectedTestReport = JSON.stringify(_.omit(expectedTestReport.stats, ["duration", "start", "end"]));

            assert.equal(actualTestReport, expectedTestReport);

            done();
        });
})();
