"use strict";

/**
 * A module to add gulp tasks which prepare the build package.
 * @exports tasks/packageTasks
 * @param {Gulp} gulp - The gulp module
 * @param {Object} context - An object containing the following properties:
 * @param {String} context.cwd - The current working directory
 * @param {Object} context.package - The package.json for the module
 * @param {Array} context.argv - The arguments past to the gulp task
 * @param {bunyan} context.logger - A logger matching the bunyan API
 */
module.exports = function packageTasks(gulp, context) {
  var fs = require('fs');
  var _ = require('underscore');

  /**
   * A gulp build task to copy files to the `package.json:directories.build` directory.
   * The existing build, tasks and reports directories are ignored.
   * @member {Gulp} package
   * @return {through2} stream
   */
  gulp.task("package", function packageTask() {
    var pkg = context.package;
    var directories = pkg.directories;
    var buildIgnoreArr;
    var BUILDIGNOREPATH = ".buildignore";
    var sourcePaths = [
      //include all files and explicitly include '.' files
      "**/*",
      ".gitignore",
      ".eslintrc",
      ".eslintignore",
      ".npmignore",
      directories.test + "/.eslintrc",
      //always exclude the following files
      "!atlassian-ide-plugin.xml",
      "!package.json",
      "!" + directories.build,
      "!" + directories.build + "/**/*",
      "!node_modules",
      "!node_modules/**/*",
      "!pub-build",
      "!pub-build/**/*"
    ];
    //read buildignore file if exists - otherwise default to preconfigured sourcePaths
    if (fs.existsSync(BUILDIGNOREPATH)) {
      buildIgnoreArr = fs.readFileSync(BUILDIGNOREPATH).toString().split("\n");
      sourcePaths = _.union(sourcePaths, _.map(buildIgnoreArr, function mapLine(line){ return "!" + line; }));
    } else {
      sourcePaths = _.union(sourcePaths, [
        "!" + directories.reports + "/",
        "!" + directories.reports + "/**/*",
        "!Tools",
        "!Tools/**/*",
        "!Temp",
        "!Temp/**/*"
      ]);
    }
    return gulp.src(sourcePaths, {"dot": true, "allowEmpty": true})
      .pipe(gulp.dest(directories.build))
      .on("end", function onEnd() {
        //move files which need to exist in a Build folder within the Build package
        //(required by source-map-closest-match)
        if (directories.functions) {
          gulp.src([
            ".azurefunctions/swagger/swagger.json"
          ])
            .pipe(gulp.dest("Build/.azurefunctions/swagger"));
        } else {
          gulp.src([
            "pub-build/**/*.*"
          ])
            .pipe(gulp.dest("Build/build"));
        }
      });
  });

  /**
   * A gulp build task to setup the gitignore file for deployment (appends the buildignore file contents).
   * @member {Gulp} metadata
   * @return {through2} stream
   */
  gulp.task("gitignoreDeploy", function metadataTask() {
    var BUILDIGNOREPATH = ".buildignore";
    var GITIGNOREPATH = ".gitignore";
    var buildIgnore = fs.readFileSync(BUILDIGNOREPATH).toString();
    var gitIgnore = fs.readFileSync(GITIGNOREPATH)
      .toString()
      .replace("/client/index.html\n", "")
      .replace("/**/client/public/*.*\n", "");
    fs.writeFileSync(GITIGNOREPATH, gitIgnore + buildIgnore);
    return gulp.src([".gitignore"])
      .pipe(gulp.dest("Build"))
      .pipe(gulp.dest("."));
  });
  gulp.task("gitignoreDeployLocal", function metadataTask() {
    var BUILDIGNOREPATH = ".buildignore";
    var GITIGNOREPATH = ".gitignore";
    var buildIgnore = fs.readFileSync(BUILDIGNOREPATH).toString();
    var gitIgnore = fs.readFileSync(GITIGNOREPATH)
      .toString()
      .replace("/client/index.html\n", "")
      .replace("/**/client/public/*.*\n", "");
    fs.writeFileSync(GITIGNOREPATH, gitIgnore + buildIgnore);
    return gulp.src([".gitignore"], {"dot": true})
      .pipe(gulp.dest("."));
  });

  /**
   * A gulp build task to setup the gitignore file for normal use (removes the buildignore file contents).
   * @member {Gulp} metadata
   * @return {through2} stream
   */
  gulp.task("gitignoreUnDeploy", function metadataTask() {
    var BUILDIGNOREPATH = ".buildignore";
    var GITIGNOREPATH = ".gitignore";
    var buildIgnore = fs.readFileSync(BUILDIGNOREPATH).toString();
    var gitIgnore = fs.readFileSync(GITIGNOREPATH).toString();
    fs.writeFileSync(GITIGNOREPATH, gitIgnore.replace(buildIgnore, "") + "/client/index.html\n/**/client/public/*.*\n");
    return gulp.src([".gitignore"], {"dot": true})
      .pipe(gulp.dest("Build"))
      .pipe(gulp.dest("."));
  });
};
