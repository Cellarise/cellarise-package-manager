"use strict";

/* Feature: Scaffold task: Add function to copy standard templates and files into a package */
module.exports = function taskUtils() {
    //setup logger
    var bunyanFormat = require("bunyan-format");
    var formatOut = bunyanFormat({"outputMode": "short"});
    var logger = require("bunyan").createLogger({"name": "TEST", "stream": formatOut});

    return {
        "clearFolders": function clearFolders(createdDirs, done) {
            var path = require("path");
            var exec = require(path.join(__dirname, "../../../bin/exec"))(logger);
            var vasync = require("vasync");
            var _ = require("underscore");

            createdDirs = _.uniq(createdDirs);
            vasync.forEachPipeline({
                "func": function clearFolderPipelineFunc(dir, callback){
                    exec.clearFolder(dir, callback);
                },
                "inputs": createdDirs
            }, done);
        }
    };
};
