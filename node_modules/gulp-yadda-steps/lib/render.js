/* jslint node: true */
"use strict";
var fs = require("fs");
var dust = require("dustjs-linkedin");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError;
var through = require("through2");
var path = require("path");

var PLUGIN_NAME = "gulp-yadda-steps";

/**
 * Render is a transform stream requiring a yadda parsed JSON file.  Render will load test step libraries tagged in the
 * feature (using @libraries=) and will attempt to load a file with the feature filename and suffix "-steps.js".
 * If one or more libraries are found they will be used to find step matches in the feature and filter them from
 * the output.
 * @memberof module:{name}
 * @alias Render
 * @param {Object} opts - Parser configuration options
 * @param {string} [opts.template_library="../templates/yadda_library.dust"] -
 * Specifies a path to a template_library dust file. This file controls the layout of new step libraries.
 * @param {string} [opts.template_insertion="../templates/yadda_insert.dust"] -
 * Specifies a path to a template_insertion dust file.
 * This file controls the layout for inserting steps into an existing step library.
 * This template should use dust partial `steps` to insert generated steps from template_steps.
 * @param {string} [opts.template_steps="../templates/yadda_steps.dust"] -
 * Specifies a path to a template_steps dust file. This file controls the layout and generation of test steps.
 * @returns {through2} readable-stream/transform
 * @example
 {>example-render/}
 */
module.exports = function gulpYaddaStepsRender(opts) {
  var templateLibrary, templateInsertion, templateSteps;

  var render = function render(data, output, callback) {
    var tmplLibrary = fs.readFileSync(path.join(__dirname, templateLibrary), "UTF-8");
    var tmplSteps = fs.readFileSync(path.join(__dirname, templateSteps), "UTF-8");
    var insertionTemplate = fs.readFileSync(path.join(__dirname, templateInsertion), "UTF-8").toString();
    var data2 = JSON.parse(data);

    //check for existing output and check if data contains steps
    if (output && data2 && data2.feature.scenarios.length > 0 && data2.feature.scenarios[0].steps.length) {
      //use regex and replace to find first scenario comment and append insertion template
      output = output.replace(/(\/\*Scenario:.*\*\/)/, insertionTemplate + "$1");
    } else if (output === null) {
      output = "{" + ">library/" + "}"; //jsdoc dust parsing error occurs if not expressed this way
    }

    dust.optimizers.format = function formatReturnNode(ctx, node) {
      return node;
    };
    dust.loadSource(dust.compile(tmplSteps, "steps", false));
    dust.loadSource(dust.compile(tmplLibrary, "library", false));
    dust.loadSource(dust.compile(output, "output", false));
    dust.render("output", data2, callback);
  };

  opts = opts || {};
  templateLibrary = opts.template_library || "../templates/yadda_library.dust";
  templateInsertion = opts.template_insertion || "../templates/yadda_insert.dust";
  templateSteps = opts.template_steps || "../templates/yadda_steps.dust";


  return through.obj(function gulpYaddaStepsRenderTransform(file, enc, cb) {
    var filePath = file.path;
    var self = this;
    var outputPath, output;

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit("error", new PluginError(PLUGIN_NAME, "Streaming not supported"));
      return cb();
    }

    //check existing file exists
    outputPath = path.dirname(filePath) + path.sep + path.basename(filePath, path.extname(filePath)) + ".js";
    output = null;
    if (fs.existsSync(outputPath)) {
      output = fs.readFileSync(outputPath, "UTF-8");
    }

    render(file.contents.toString(), output, function renderCallback(err, output2) {
      try {
        file.contents = new Buffer(output2);
        file.path = path.relative(process.cwd(), outputPath);
        self.push(file);
      } catch (err) {
        self.emit("error", new PluginError(PLUGIN_NAME, err, {"fileName": file.path}));
      }
      return cb();
    });
  });
};
