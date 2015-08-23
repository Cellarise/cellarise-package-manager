"use strict";

/* Feature: Security task: Add Node Security Project validation check and report task */
module.exports = (function testSuite() {
    var English = require("yadda").localisation.English;
    var assert = require("assert");

    return English.library()
        /*Scenario:  */
        .define("Given", function test(done) {
            assert(true);
            done();
        })
        .define("When", function test(done) {
            assert(true);
            done();
        })
        .define("Then", function test(done) {
            assert(true);
            done();
        });
})();
