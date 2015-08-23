 Given the feature file:

```markdown
Feature: Generate test steps from gherkin features
As a developer
I want to be able to generate test step boilerplate code from gherkin features
So that I can focus effort on building quality test steps

Scenario: Generating test steps

Given I have a simple feature file
When I read the feature file
Then a test steps file is generated
```

When you pass the feature file to a `new gulpYaddaSteps()`, and pipe it to a given destination.

```js
var gulpYaddaSteps = require('gulp-yadda-steps');
gulp.src('local.feature')
.pipe(new gulpYaddaSteps())
.pipe(fs.createWriteStream('output.js'));
```

Then you'll get a Yadda style test step library:

```js
"use strict";
var English = require('yadda').localisation.English;

/ Feature: Generate test steps from gherkin features /
module.exports = (function() {
 return English.library()
   /Generating test steps/
   .define("Given I have a simple feature file", function(done) {
       this.assert(false);
       done();
   })
   .define("When I read the feature file", function(done) {
       this.assert(false);
       done();
   })
   .define("Then a test steps file is generated", function(done) {
       this.assert(false);
       done();
   });
})();
```

Note that the output is a vinyl file which will have the filePath overridden if the libraryBasePath and featureBasePath options are set.
