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

When you pass the feature file to a `new Parser()`, and pipe it to a given destination.

```js
var Parser = require('gulp-yadda-steps').Parser;
gulp.src('local.feature')
.pipe(new Parser())
.pipe(fs.createWriteStream('output.json'));
```

Then you'll get a Yadda parsed JSON output:

```js
{"feature":{"title":"Generate test steps from gherkin features","annotations":{},
"description":["As a developer","I want to be able to generate test step boilerplate code from gherkin features",
"So that I can focus effort on building quality test steps"],
"scenarios":[{"title":"Generating test steps",
"annotations":{},"description":[],
"steps":["Given I have a simple feature file","When I read the feature file","Then a test steps file is generated"]}]}}
```

Note that the output is a vinyl file which will have the filePath overridden if the libraryBasePath and featureBasePath options are set.
