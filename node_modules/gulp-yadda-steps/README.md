# gulp-yadda-steps
[![view on npm](http://img.shields.io/npm/v/gulp-yadda-steps.svg?style=flat)](https://www.npmjs.org/package/gulp-yadda-steps)
[![npm module downloads per month](http://img.shields.io/npm/dm/gulp-yadda-steps.svg?style=flat)](https://www.npmjs.org/package/gulp-yadda-steps)
[![Dependency status](https://david-dm.org/Cellarise/gulp-yadda-steps.svg?style=flat)](https://david-dm.org/Cellarise/gulp-yadda-steps)
[![Coverage](https://img.shields.io/badge/coverage-90%25_skipped:0%25-green.svg?style=flat)](https://www.npmjs.org/package/gulp-yadda-steps)

> A gulp task to generate or update Yadda test step libraries from Gherkin features (natural language test scripts).


##Usage 

This gulp task expects a feature file, written in Gherkin syntax, as input, and outputs the matching Yadda test step libraries for this feature file.

### As a gulp task

Require this package and use as part of your gulp task.

```js
var GulpYaddaSteps = require('gulp-yadda-steps');
gulp.src('local.feature')
.pipe(new GulpYaddaSteps())
.pipe(fs.createWriteStream('output.js'));
```


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


#Changelog

<table style="width:100%;border-spacing:0px;border-collapse:collapse;margin:0px;padding:0px;border-width:0px;">
  <tr>
    <th style="width:20px;text-align:center;"></th>
    <th style="width:80px;text-align:center;">Type</th>
    <th style="width:80px;text-align:left;">ID</th>
    <th style="text-align:left;">Summary</th>
  </tr>
    
      <tr>
        <td colspan=4><strong>Version: 0.1.10 - released 2014-10-19</strong></td>
      </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGSTEP-20</td>
            <td>Parser: Change option &#39;library_suffix&#39; to camelcase &#39;librarySuffix&#39;</td>
          </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10411&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Feature</td>
            <td style="width:80px;text-align:left;">MDGSTEP-19</td>
            <td>Template: Update step library template to match new eslint rules</td>
          </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGSTEP-18</td>
            <td>Package: Migrate from jshint to eslint static code analysis</td>
          </tr>
        
    
      <tr>
        <td colspan=4><strong>Version: 0.1.9 - released 2014-10-12</strong></td>
      </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGSTEP-17</td>
            <td>Package: Update package dependencies</td>
          </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGSTEP-16</td>
            <td>Package: Remove all gulp tasks except &#39;test&#39; and update readme docs</td>
          </tr>
        
    
      <tr>
        <td colspan=4><strong>Version: 0.1.8 - released 2014-10-06</strong></td>
      </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGSTEP-15</td>
            <td>Package: Update package dependencies</td>
          </tr>
        
    
      <tr>
        <td colspan=4><strong>Version: 0.1.7 - released 2014-09-22</strong></td>
      </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGSTEP-14</td>
            <td>Parser: Add error logger to require step library function</td>
          </tr>
        
    
      <tr>
        <td colspan=4><strong>Version: 0.1.6 - released 2014-09-20</strong></td>
      </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10403&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Bug</td>
            <td style="width:80px;text-align:left;">MDGSTEP-9</td>
            <td>Render: Fix steps not being created in existing step-libraries.</td>
          </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10411&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Feature</td>
            <td style="width:80px;text-align:left;">MDGSTEP-13</td>
            <td>Template: Update step library template to move all code within the module exports function</td>
          </tr>
        
    
      <tr>
        <td colspan=4><strong>Version: 0.1.5 - released 2014-09-13</strong></td>
      </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10411&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Feature</td>
            <td style="width:80px;text-align:left;">MDGSTEP-8</td>
            <td>Template: Update step library to require assert package.</td>
          </tr>
        
    
      <tr>
        <td colspan=4><strong>Version: 0.1.4 - released 2014-08-28</strong></td>
      </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGSTEP-6</td>
            <td>Package: Migrate to new Cellarise Package Manager.</td>
          </tr>
        
    
      <tr>
        <td colspan=4><strong>Version: 0.1.3 - released 2014-08-17</strong></td>
      </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10403&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Bug</td>
            <td style="width:80px;text-align:left;">MDGSTEP-5</td>
            <td>Render: Fix duplicate steps generated in output.</td>
          </tr>
        
    
      <tr>
        <td colspan=4><strong>Version: 0.1.2 - released 2014-08-14</strong></td>
      </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10403&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Bug</td>
            <td style="width:80px;text-align:left;">MDGSTEP-4</td>
            <td>Package: Fix path to main library in package.json.</td>
          </tr>
        
    
      <tr>
        <td colspan=4><strong>Version: 0.1.0 - released 2014-08-13</strong></td>
      </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10411&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Feature</td>
            <td style="width:80px;text-align:left;">MDGSTEP-3</td>
            <td>Package: Automate adding missing test steps from a test feature script.</td>
          </tr>
        
          <tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com/secure/viewavatar?size=xsmall&amp;avatarId=10411&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Feature</td>
            <td style="width:80px;text-align:left;">MDGSTEP-2</td>
            <td>Package: Generate test steps from gherkin features.</td>
          </tr>
        
    
</table>



# License

MIT License (MIT). All rights not explicitly granted in the license are reserved.

Copyright (c) 2014 John Barry

## Dependencies
[ansi-regex@0.2.1](&quot;https://github.com/sindresorhus/ansi-regex&quot;) - &quot;MIT&quot;, [ansi-styles@1.1.0](&quot;https://github.com/sindresorhus/ansi-styles&quot;) - &quot;MIT&quot;, [chalk@0.5.1](&quot;https://github.com/sindresorhus/chalk&quot;) - &quot;MIT&quot;, [clone-stats@0.0.1](&quot;https://github.com/hughsk/clone-stats&quot;) - &quot;MIT&quot;, [core-util-is@1.0.1](&quot;https://github.com/isaacs/core-util-is&quot;) - &quot;MIT&quot;, [dateformat@1.0.8](&quot;https://github.com/felixge/node-dateformat&quot;) - &quot;MIT*&quot;, [duplexer2@0.0.2](&quot;https://github.com/deoxxa/duplexer2&quot;) - &quot;BSD&quot;, [dustjs-helpers@1.3.0](&quot;https://github.com/linkedin/dustjs-helpers&quot;) - &quot;MIT&quot;, [dustjs-linkedin@2.4.2](&quot;https://github.com/linkedin/dustjs&quot;) - &quot;MIT&quot;, [escape-string-regexp@1.0.2](&quot;https://github.com/sindresorhus/escape-string-regexp&quot;) - &quot;MIT&quot;, [gulp-util@3.0.1](&quot;https://github.com/wearefractal/gulp-util&quot;) - [&quot;MIT&quot;], [gulp-yadda-steps@0.0.0](&quot;https://github.com/Cellarise/gulp-yadda-steps&quot;) - &quot;MIT License (MIT)&quot;, [has-ansi@0.1.0](&quot;https://github.com/sindresorhus/has-ansi&quot;) - &quot;MIT&quot;, [inherits@2.0.1](&quot;https://github.com/isaacs/inherits&quot;) - &quot;ISC&quot;, [isarray@0.0.1](&quot;https://github.com/juliangruber/isarray&quot;) - &quot;MIT&quot;, [lodash._escapehtmlchar@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash._escapestringchar@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash._htmlescapes@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash._isnative@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash._objecttypes@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash._reinterpolate@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash._reunescapedhtml@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash._shimkeys@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash.defaults@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash.escape@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash.isobject@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash.keys@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash.template@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash.templatesettings@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash.values@2.4.1](&quot;https://github.com/lodash/lodash-cli&quot;) - &quot;MIT&quot;, [lodash@2.4.1](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [minimist@1.1.0](&quot;https://github.com/substack/minimist&quot;) - &quot;MIT&quot;, [multipipe@0.1.1](&quot;https://github.com/segmentio/multipipe&quot;) - &quot;MIT*&quot;, [readable-stream@1.0.33-1](&quot;https://github.com/isaacs/readable-stream&quot;) - &quot;MIT&quot;, [readable-stream@1.1.13](&quot;https://github.com/isaacs/readable-stream&quot;) - &quot;MIT&quot;, [streamifier@0.1.0](&quot;https://github.com/gagle/node-streamifier&quot;) - &quot;MIT&quot;, [string_decoder@0.10.31](&quot;https://github.com/rvagg/string_decoder&quot;) - &quot;MIT&quot;, [strip-ansi@0.3.0](&quot;https://github.com/sindresorhus/strip-ansi&quot;) - &quot;MIT&quot;, [supports-color@0.2.0](&quot;https://github.com/sindresorhus/supports-color&quot;) - &quot;MIT&quot;, [through2@0.6.3](&quot;https://github.com/rvagg/through2&quot;) - &quot;MIT&quot;, [underscore@1.7.0](&quot;https://github.com/jashkenas/underscore&quot;) - [&quot;MIT&quot;], [vinyl@0.4.3](&quot;https://github.com/wearefractal/vinyl&quot;) - [&quot;MIT&quot;], [xtend@4.0.0](&quot;https://github.com/Raynos/xtend&quot;) - [&quot;MIT&quot;], [yadda@0.11.2](&quot;https://github.com/acuminous/yadda&quot;) - &quot;Apache2&quot;, 
*documented by [npm-licenses](http://github.com/AceMetrix/npm-license.git)*.