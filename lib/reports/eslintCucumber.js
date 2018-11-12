"use strict";

/**
 * Eslint cucumber report
 * @exports reports/eslintCucumber
 * @param {Array} results - eslint results returned through gulp-eslint
 * @returns {Object} Eslint cucumber report formatter
 */
module.exports = function eslintCucumber(results) {
  var base = require("./baseCucumber")();
  var report = base.prepare(
    "feature",
    "Eslint code analysis",
      "As a developer\n" +
      "I want to ensure Eslint code analysis standards are met\n" +
      "So that my code is conformant with technical standards designed to ensure consistency and readability");
  var getMessageType = function getMessageType(message) {
    if (message.fatal || message.severity === 2) {
      return "Error";
    }
    return "Warning";
  };
  var messageFormat = function messageFormat(suite, message) {
    var output = getMessageType(message);
    output += message.ruleId ? " (" + message.ruleId + "):" : " :";
    output += " [line:" + (message.line || 0);
    output += ",col:" + (message.column || 0);
    output += "] - " + message.message;
    output += "\n";
    return output;
  };

  results.forEach(function eachResult(result) {
    var suite = result.filePath;
    var messages = result.messages;
    var messageOutput = "";
    var testPass = true;

    var scenario = {
      "id": suite.replace(/.*[\\/]/, ""),
      "keyword": "Scenario",
      "name": suite.replace(/.*[\\/]/, ""),
      "line": 3,
      "description": suite,
      "type": "scenario",
      "steps": [
        {
          "result": {
            "duration": 0,
            "status": "passed"
          },
          "name": "a Javascript file and the repositories default ESLint configuration file",
          "keyword": "Given ",
          "line": 4
        },
        {
          "result": {
            "duration": 0,
            "status": "passed"
          },
          "name": "analysed using ESLint",
          "keyword": "When ",
          "line": 5
        },
        {
          "result": {
            "duration": 0,
            "status": "passed"
          },
          "name": "the file should meet the defined coding standards",
          "keyword": "Then ",
          "line": 6
        }
      ]
    };

    if (messages.length > 0) {
      messages.forEach(function eachMessage(message) {
        if (message.fatal || message.severity === 2) {
          testPass = false;
        }
        messageOutput += messageFormat(suite, message);
      });
    }

    if (!testPass) {
      scenario.steps[2].result.status = "failed";
      /*eslint camelcase:0*/
      scenario.steps[2].result.error_message = messageOutput;
    }
    report[0].elements.push(scenario);
  });

  return JSON.stringify(report, null, 2);
};
