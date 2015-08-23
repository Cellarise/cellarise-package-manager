 Given a yadda parsed JSON file:

```js
{"feature":{"title":"Generate test steps from gherkin features","annotations":{},
"description":["As a developer","I want to be able to generate test step boilerplate code from gherkin features",
"So that I can focus effort on building quality test steps"],
"scenarios":[{"title":"Generating test steps",
"annotations":{},
"description":[],
"steps":["Given I have a simple feature file","When I read the feature file","Then a test steps file is generated"]}]}}
```

 When you pass the yadda parsed JSON file to a `new Render()`, and pipe it to a given destination.

```js
var Render = require('gulp-yadda-steps').Render;
gulp.src('output.json')
.pipe(new Render())
.pipe(fs.createWriteStream('output.js'));
```

 Then you'll get a Yadda style test step library:

```js
"use strict";
var English = require('yadda').localisation.English;
var assert = require('assert');

/ Feature: Generate test steps from gherkin features /
module.exports = (function() {
return English.library()
   /Generating test steps/
   .define("Given I have a simple feature file", function(done) {
       assert(true);
       done();
   })
   .define("When I read the feature file", function(done) {
       assert(true);
       done();
   })
   .define("Then a test steps file is generated", function(done) {
       assert(true);
       done();
   });
})();
```

 Note that the output is a vinyl file which will have the filePath overridden if the libraryBasePath and featureBasePath options are set.
