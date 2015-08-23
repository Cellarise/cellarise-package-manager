"use strict";

/**
 * Command line executable build utilities
 * @exports utils/exec
 * @param {bunyan} logger - A logger matching the bunyan API
 * @returns {Object} - return executable object
 */
module.exports = function exec(logger) {
    var exec = require("child_process").exec;
    var path = require("path");
    var fs = require("fs");
    var binDirectory = path.join(__dirname);

    var exports = {
        /**
         * Execute a command in a windows command prompt and return the result in a callback function.
         * @param {String} command - the command to execute
         * @param {String} [cwd=process.cwd()] - the current working directory
         * @param {String} env - override the environment
         * @param {Function} cb - callback function with signature: function(err, data)
         */
        "execCommand": function execCommand(command, cwd, env, cb) {
            cwd = cwd || process.cwd();
            env = env || process.env;
            logger.info("Executing " + command + " in " + cwd);
            exec(binDirectory + path.sep + command, {
                    "cwd": cwd,
                    "env": env,
                    "maxBuffer": 10000 * 1024
                },
                function execCommandCallback(error, stdout, stderr) {
                    if (error){
                        logger.error(error);
                        if (stderr){
                            logger.error(stderr);
                        }
                    }
                    cb(error, stdout);
                });
        },

        /**
         * Clear the contents of a folder and delete the folder.
         * @param {String} files - the file to delete (specify multiple files by using wildcards).
         * @param {Function} cb - callback function with signature: function(err, data)
         */
        "clearFiles": function clearFiles(files, cb) {
            this.execCommand("cpm del " + files, process.cwd(), null, function clearFilesCallback(err, stdout) {
                err = null;
                cb(err, stdout);//do not pass through any error
            });
        },

        /**
         * Clear the contents of a folder and delete the folder.
         * @param {String} folder - the folder to clear and delete
         * @param {Function} cb - callback function with signature: function(err, data)
         */
        "clearFolder": function clearFolder(folder, cb) {
            if (fs.existsSync(folder)){
                this.execCommand("cpm cleanFolder " + folder, process.cwd(), null, function clearFolderCallback(err, stdout) {
                    err = null;
                    cb(err, stdout);//do not pass through any error
                });
            } else {
                cb(null, "Folder does not exist");//do not pass through any error
            }
        },

        /**
         * Clone a repository to a provided directory.
         * @param {String} repositoryPath - path to the repository
         * @param {String} cloneToDir - the directory to clone to relative to the current working directory
         * @param {String} [cwd=process.cwd()] - the current working directory
         * @param {Function} cb - callback function with signature: function(err, data)
         */
        "cloneFromGit": function cloneFromGit(repositoryPath, cloneToDir, cwd, cb) {
            this.execCommand("cgitsh Auto-Git-clone " + repositoryPath + ".git " + cloneToDir, cwd, null,
                function cloneFromGitCallback(err, stdout) {
                    err = null;
                    cb(err, stdout);//do not pass through any error
                });
        },

        /**
         * Commit to git.
         * @param {String} commit - the commit message
         * @param {String} [cwd=process.cwd()] - the current working directory
         * @param {Function} cb - callback function with signature: function(err, data)
         */
        "commitGit": function commitGit(commit, cwd, cb) {
            this.execCommand("cgitsh Auto-Git-commit \"" + commit + "\"", cwd, null, function commitGitCallback(err, stdout) {
                //err = null; //do not pass through any error
                cb(err, stdout);
            });
        },

        /**
         * Run a gulp task.
         * @param {String} task - the gulp task
         * @param {String} [cwd=process.cwd()] - the current working directory
         * @param {Function} cb - callback function with signature: function(err, data)
         */
        "runGulpTask": function runGulpTask(task, cwd, cb) {
            this.execCommand("cgulp.cmd " + task, cwd, null, cb);
        },

        /**
         * Run a CPM command.
         * @param {String} command - the CPM command
         * @param {String} [cwd=process.cwd()] - the current working directory
         * @param {Function} cb - callback function with signature: function(err, data)
         */
        "runCPM": function runCPM(command, cwd, cb) {
            this.execCommand("cpm.bat " + command, cwd, null, cb);
        }
    };

    return exports;
};
