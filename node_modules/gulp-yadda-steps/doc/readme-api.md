# API
<a name="module_gulp-yadda-steps"></a>
#gulp-yadda-steps
A gulp task to generate or update Yadda test step libraries from Gherkin features (natural language test scripts).

**Params**

- opts `Object` - Task configuration options (see modules Parser and Render for more information)  

**Type**: `name`  
**Returns**: `through2` - readable-stream/transform  
**Example**  
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


<a name="module_gulp-yadda-steps.Render"></a>
##gulp-yadda-steps.Render(opts)
Render is a transform stream requiring a yadda parsed JSON file.  Render will load test step libraries tagged in the
feature (using @libraries=) and will attempt to load a file with the feature filename and suffix "-steps.js".
If one or more libraries are found they will be used to find step matches in the feature and filter them from
the output.

**Params**

- opts `Object` - Parser configuration options  
  - \[template_library="../templates/yadda_library.dust"\] `string` - Specifies a path to a template_library dust file. This file controls the layout of new step libraries.  
  - \[template_insertion="../templates/yadda_insert.dust"\] `string` - Specifies a path to a template_insertion dust file.
This file controls the layout for inserting steps into an existing step library.
This template should use dust partial `steps` to insert generated steps from template_steps.  
  - \[template_steps="../templates/yadda_steps.dust"\] `string` - Specifies a path to a template_steps dust file. This file controls the layout and generation of test steps.  

**Returns**: `through2` - readable-stream/transform  
**Example**  
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



*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*.