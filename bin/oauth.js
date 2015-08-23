#!/usr/bin/env node
"use strict";
var path = require("path");
var cwd = path.resolve(__dirname, "..");
process.chdir(cwd);
require(cwd + "/node_modules/oauth-rest-atlassian/server.js");
