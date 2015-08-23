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