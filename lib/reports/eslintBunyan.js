"use strict";

/**
 * Eslint bunyan report logger.
 * @exports reports/eslintBunyan
 * @param {Array} results - eslint results returned through gulp-eslint
 * @returns {String} empty string
 */
module.exports = function eslintBunyan(results) {
  var bunyanFormat = require("bunyan-format");
  var formatOut = bunyanFormat({"outputMode": "short"});
  var logger = require("bunyan").createLogger({"name": "CGULP", "stream": formatOut});

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
    output += "]"; // - " + message.message;
    return output;
  };

  results.forEach(function eachResult(result) {
    var suite = result.filePath.replace(/.*[\\/]/, "");
    var messages = result.messages;
    var messageOutput;

    if (messages.length > 0) {
      messages.forEach(function eachMessage(message) {
        messageOutput = suite + ": " + messageFormat(message);
        if (message.fatal || message.severity === 2) {
          logger.error(messageOutput);
        } else {
          logger.warn(messageOutput);
        }
      });
    }
  });

  return "";
};
