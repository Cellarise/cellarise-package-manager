# gulp-load-params
[![view on npm](http://img.shields.io/npm/v/gulp-load-params.svg?style=flat)](https://www.npmjs.org/package/gulp-load-params)
[![npm module downloads per month](http://img.shields.io/npm/dm/gulp-load-params.svg?style=flat)](https://www.npmjs.org/package/gulp-load-params)
[![Dependency status](https://david-dm.org/Cellarise/gulp-load-params.svg?style=flat)](https://david-dm.org/Cellarise/gulp-load-params)
[![Coverage](https://img.shields.io/badge/coverage-92%25_skipped:0%25-green.svg?style=flat)](https://www.npmjs.org/package/gulp-load-params)

> Load gulp task just like grunt.loadTasks and pass parameters through an options object.


## Usage

Require gulp-load-params in your gulpfile

```
var gulp = require('gulp');
require('gulp-load-params')(gulp);

// load tasks from tasks directory and
// dependencies of start with `gulp-` in package.json
// pass parameters using the options object
var options = { obj: 'obj1'};
gulp.loadTasks(__dirname, options);

// run tasks which you loaded
gulp.tasks('default', function() {
  gulp.run('your_task');
})
```


# API
<a name="module_gulp-load-params"></a>
#gulp-load-params
Load gulp task just like grunt.loadTasks and pass parameters through an options object.
**Params**

- gulp `Object` - The gulp module  
- opts `Object` - optional options  
  - \[modulePrefix="gulp-"\] `Object` - load dependencies that start with this prefix in package.json.  
  - \[taskPath="tasks"\] `Object` - load tasks from this directory path.  

**Type**: `name`  
**Returns**: `loadTasks` - loadTasks function  
**Example**  
gulp-load-params will return a function that is same as `gulp.loadTasks`.

```
var loadTasks = require('gulp-load-params')(gulp);
loadTasks === gulp.loadTasks // return true
```

LoadTasks can load single file.

```
gulp.loadTasks('path/to/task.js');
```

LoadTasks can load specified module.

```
gulp.loadTasks('path/to/module');
```

LoadTasks can load by module's name. It will lookup from `NODE_PATH` and node_modules of current module.

```
gulp.loadTasks('gulp-concat');
```

**If load a module, it will load task from tasks directory of current module, and if gulp plugins (start with gulp-) exists in dependencies of package.json, then it will load each plugin as a module.**
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
        <td colspan=4><strong>Version: 0.1.5 - released 2015-03-07</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGPLOAD-11</td>
            <td>Package: Update package dependencies</td>
          </tr>
        
<tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGPLOAD-10</td>
            <td>Package: Update eslint configuration, test.js runner and dev dependencies</td>
          </tr>
        
<tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGPLOAD-9</td>
            <td>Package: Update eslint configuration, test.js runner and dev dependencies</td>
          </tr>
        
<tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGPLOAD-8</td>
            <td>Package: Migrate from jshint to eslint static code analysis</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.4 - released 2014-10-11</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGPLOAD-7</td>
            <td>Package: Add option to provide an alternate lookup path for gulp tasks</td>
          </tr>
        
<tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGPLOAD-6</td>
            <td>Package: Remove all gulp tasks except &#39;test&#39;</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.3 - released 2014-08-27</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGPLOAD-5</td>
            <td>Package: Update dependencies.</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.2 - released 2014-08-27</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGPLOAD-4</td>
            <td>Package: Migrate to new Cellarise Package Manager.</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.1 - released 2014-08-25</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10403&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Bug</td>
            <td style="width:80px;text-align:left;">MDGPLOAD-3</td>
            <td>Package: Fix tasks in gulp packages overriding tasks in primary module.</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.0 - released 2014-08-25</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;text-align:center;"><img src='https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10411&amp;avatarType=issuetype'/></td>
            <td style="width:80px;text-align:center;">Feature</td>
            <td style="width:80px;text-align:left;">MDGPLOAD-2</td>
            <td>Develop a gulp task loader with parameters</td>
          </tr>
        
    
</table>



# License

MIT License (MIT). All rights not explicitly granted in the license are reserved.

Copyright (c) 2015 John Barry
## Dependencies
[balanced-match@0.2.0](&quot;https://github.com/juliangruber/balanced-match&quot;) - &quot;MIT&quot;, [brace-expansion@1.1.0](&quot;https://github.com/juliangruber/brace-expansion&quot;) - &quot;MIT&quot;, [concat-map@0.0.1](&quot;https://github.com/substack/node-concat-map&quot;) - &quot;MIT&quot;, [glob@5.0.0](&quot;https://github.com/isaacs/node-glob&quot;) - &quot;ISC&quot;, [gulp-load-params@0.0.0](&quot;https://github.com/Cellarise/gulp-load-params&quot;) - &quot;MIT License (MIT)&quot;, [inflight@1.0.4](&quot;https://github.com/isaacs/inflight&quot;) - &quot;ISC&quot;, [inherits@2.0.1](&quot;https://github.com/isaacs/inherits&quot;) - &quot;ISC&quot;, [minimatch@2.0.1](&quot;https://github.com/isaacs/minimatch&quot;) - &quot;MIT&quot;, [once@1.3.1](&quot;https://github.com/isaacs/once&quot;) - &quot;BSD&quot;, [underscore@1.8.2](&quot;https://github.com/jashkenas/underscore&quot;) - &quot;MIT&quot;, [wrappy@1.0.1](&quot;https://github.com/npm/wrappy&quot;) - &quot;ISC&quot;, 
*documented by [npm-licenses](http://github.com/AceMetrix/npm-license.git)*.