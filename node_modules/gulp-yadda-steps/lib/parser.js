"use strict";
var path = require("path");
var Yadda = require("yadda");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError;
var through = require("through2");
var _ = require("underscore");

var PLUGIN_NAME = "gulp-yadda-steps";

/**
 * Parser is a transform stream requiring a valid feature file.  Parser will load test step libraries tagged in the
 * feature (using @libraries=) and will attempt to load a file with the feature filename and suffix "-steps.js".
 * If one or more libraries are found they will be used to find step matches in the feature and filter them
 * from the output.
 * @memberof {name}
 * @alias Parser
 * @param {Object} opts - Parser configuration options
 * @param {string} [opts.libraryBasePath=""] - Specifies a path to the base location for the test step libraries.
 * E.g. if the base path to the test step library is `Test/unit/steps/` use `path.join(__dirname, "./steps/")`
 * if the script is running from `"Test/unit"`.
 * Note: featureBasePath must also be set for this option to take effect.
 * @param {string} [opts.featureBasePath=""] - Specifies a path to the base location for the features.
 * Note: libraryBasePath must also be set for this option to take effect.
 * @param {string} [opts.librarySuffix="-steps"] - Specifies the suffix for step libraries
 * @returns {through2} readable-stream/transform
 * @example
 {>example-parser/}
 */
module.exports = function gulpYaddaStepsParser(opts) {
  var libraryPath = "";
  //var featureName = "";
  var featurePath = "";
  var stepLibraryName = "";

  var parser = new Yadda.parsers.FeatureParser(opts.language);

  var requireLibraries = function requireLibraries(libraries) {
    var i, requiredLibraries = [];
    for (i = 0; i < libraries.length; i = i + 1) {
      try {
        requiredLibraries.push(require(libraries[i]));
      } catch (err) {
        //console.log(err);
      }
    }
    return requiredLibraries;
  };

  var getLibraries = function getLibraries(feature) {
    var libraries = [];
    var i;

    if (typeof feature.annotations.libraries !== "undefined") {
      libraries = feature.annotations.libraries.split(", "); //load any libraries annotated in the feature file
      //set paths relative to feature file
      for (i = 0; i < libraries.length; i = i + 1) {
        libraries[i] = path.resolve(libraryPath, libraries[i]);
      }
    }

    libraries.push(path.join(libraryPath, stepLibraryName));

    return requireLibraries(libraries);
  };

  var renderOutput = function renderOutput(feature) {
    var libraries = getLibraries(feature);
    var interpreter = new Yadda.Yadda(libraries).interpreter;
    var data = {};
    var uniqueSteps = [];
    var aIdx, bIdx, aLen, bLen, scenario, step;

    data.feature = feature;
    //iterate through scenarios
    aLen = data.feature.scenarios.length;
    for (aIdx = 0; aIdx < aLen; aIdx = aIdx + 1) {
      //iterate through steps
      scenario = data.feature.scenarios[aIdx];
      bLen = scenario.steps.length;
      for (bIdx = bLen - 1; bIdx > -1; bIdx = bIdx - 1) {
        //check if step already exists in libraries
        step = scenario.steps[bIdx];
        //check if in uniqueSteps else add
        if (interpreter.rank_macros(step).validate().valid || _.contains(uniqueSteps, step)) {
          //if found then remove from output
          data.feature.scenarios[aIdx].steps.splice(bIdx, 1);
        }
        if (!_.contains(uniqueSteps, step)) {
          uniqueSteps.push(step);
        }
      }
    }
    return JSON.stringify(data);
  };

  opts = opts || {};
  opts.libraryBasePath = opts.libraryBasePath || "";
  opts.featureBasePath = opts.featureBasePath || "";
  opts.librarySuffix = opts.librarySuffix || "-steps";

  return through.obj(function gulpYaddaStepsParserTransform(file, enc, cb) {
    var filePath = file.path,
      text = file.contents.toString(),
      feature,
      output;

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit("error", new PluginError(PLUGIN_NAME, "Streaming not supported"));
      return cb();
    }

    //setup feature and library paths and names
    featurePath = path.dirname(filePath); //assume absolute path
    //featureName = path.basename(filePath);
    stepLibraryName = path.basename(filePath, ".feature") + opts.librarySuffix + ".js";
    //set library path relative to feature path
    if (opts.libraryBasePath === "" || opts.featureBasePath === "") {
      libraryPath = featurePath + path.sep; //assume this creates an absolute path
    } else {
      libraryPath = opts.libraryBasePath +
        featurePath.replace(opts.featureBasePath, "") + //relative path from feature base to feature
        path.sep; //assume this creates an absolute path
    }

    try {
      feature = parser.parse(text);
      output = renderOutput(feature, filePath);
      file.contents = new Buffer(output);
      //replace output path to that of library
      file.path = path.relative(process.cwd(), libraryPath + stepLibraryName);
      this.push(file);
    } catch (err) {
      this.emit("error", new PluginError(PLUGIN_NAME, err, {"fileName": file.path}));
    }

    cb();
  });
};
