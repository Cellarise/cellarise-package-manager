"use strict";

/**
 * Eslint mocha report
 * @exports reports/eslintMocha
 * @param {Array} results - eslint results returned through gulp-eslint
 * @returns {Object} Eslint mocha report formatter
 */
module.exports = function eslintMocha(results) {
  var base = require("./baseMocha")();
  var report = base.prepare();
  var getMessageType = function getMessageType(message) {
    if (message.fatal || message.severity === 2) {
      return "Error";
    }
    return "Warning";
  };
  var messageFormat = function messageFormat(message) {
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
    var messageOutput = suite.replace(/.*[\\/]/, "") + "\n";
    var mochaOutput = {
      "title": suite.replace(/.*[\\/]/, ""),
      "fullTitle": suite,
      "duration": 0
    };
    var testPass = true;

    if (messages.length > 0) {
      messages.forEach(function eachMessage(message) {
        if (message.fatal || message.severity === 2) {
          testPass = false;
        }
        messageOutput += messageFormat(message);
      });
      mochaOutput.error = messageOutput;
    }
    base.write(suite, testPass, mochaOutput, report);
  });

  return JSON.stringify(report, null, 2);
};
