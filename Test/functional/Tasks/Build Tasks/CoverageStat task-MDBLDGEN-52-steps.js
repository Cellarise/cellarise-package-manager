"use strict";
/* Feature: CoverageStat task: Calculate coverage summary statistics for visual badge */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");
  return English.library()
  /*Scenario: Generate summary coverage statistics */
    .define("Given a test package with 100% coverage across all statistics",
      function test(done) {
        this.world.testPackageJSON = {
          "config": {
            "private": false,
            "projectCode": "MDTEST",
            "build": "n/a",
            "buildTimestamp": "2014-08-13T04:52:58.448Z",
            "adminEmail": "admin@cellarise.com",
            "coverage": {
              "watermarks": {
                "statements": [50, 80, 20],
                "lines": [50, 80, 20],
                "functions": [50, 80, 20],
                "branches": [50, 80, 20]
              }
            }
          }
        };
        assert(true);
        done();
      })
    .define("When calculating the summary coverage statistics",
      function test(done) {
        var coverageReport = {};
        this.world.testPackageJSON =
          require("../../../../tasks/lib/coverageStats")(this.world.logger)
            .calculateCoverageStats(coverageReport, this.world.testPackageJSON);
        assert(this.world.testPackageJSON);
        done();
      })
    .define("Then a brightgreen colour is returned for all statistics",
      function test(done) {
        var expectedPackageJSON = {
          "config": {
            "private": false,
            "projectCode": "MDTEST",
            "build": "n/a",
            "buildTimestamp": "2014-08-13T04:52:58.448Z",
            "adminEmail": "admin@cellarise.com",
            "coverage": {
              "watermarks": {
                "statements": [50, 80, 20],
                "lines": [50, 80, 20],
                "functions": [50, 80, 20],
                "branches": [50, 80, 20]
              },
              "stats": {
                "lines": {
                  "pctSkipped": 0,
                  "pct": 100,
                  "colour": "brightgreen"
                },
                "branches": {
                  "pctSkipped": 0,
                  "pct": 100,
                  "colour": "brightgreen"
                },
                "statements": {
                  "pctSkipped": 0,
                  "pct": 100,
                  "colour": "brightgreen"
                },
                "functions": {
                  "pctSkipped": 0,
                  "pct": 100,
                  "colour": "brightgreen"
                },
                "skipped": {
                  "pct": 0
                },
                "overall": {
                  "pct": 100,
                  "colour": "brightgreen"
                }
              }
            }
          }
        };
        assert.deepEqual(this.world.testPackageJSON, expectedPackageJSON.config.coverage.stats);
        done();
      });
})();
