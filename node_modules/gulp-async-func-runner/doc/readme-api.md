## API
<a name="module_gulp-async-func-runner"></a>
### gulp-async-func-runner ⇒ <code>through2</code>
A gulp task for running asynchronous functions.
**Returns**: <code>through2</code> - readable-stream/transform  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| opts | <code>Object</code> |  | optional options. Options to be passed to the task function should be provided in this object. |
| [opts.oneTimeRun] | <code>Object</code> | <code>false</code> | flag to run the task only once no matter how many data chunks are passed through the stream |
| [opts.passThrough] | <code>Object</code> | <code>false</code> | flag to pass data chunks through without modification. Default behaviour is to stream the data transformed by the asynchronous function. Set to passThrough to true if you only want to use the results of the asynchronous function as part of the `done` callback function. |
| task | <code>function</code> |  | the asynchronous task to call and wait for callback to be executed. The task must be a function with the following signature: task(options, chunk, enc, callback)    - options {Object} - an options object. This will be passed the opts parameter from this module.    - chunk {Object} - the current chunk of data passing through stream.    - callback  - the callback function to be executed once task complete.    The callback function has the following signature: callback(error, data).    This will be passed the done parameter from this module which must have a matching signature. |
| done | <code>function</code> |  | the callback function called once the asynchronous task has completed. The function must have the following signature: done(error, data). |

**Example**  
Usage:
```
var asyncPipe = require('gulp-async-func-runner');
```

Given a simple asynchronous function:
```js
var asyncFunc = function (opts, cb) {
    assert.equal(opts.testOpt, "test option");
    cb(false, "test data");
};
```

When executing the function as part of a gulp pipe:
```js
var opts = {
    oneTimeRun: true,
    passThrough: true,
    testOpt: "test option"
};
gulp.src('test/*')
    .pipe(asyncPipe(
        opts,
        function(opts, chunk, cb) {
            asyncFunc(opts, cb); //wrap in function to match the function signature
        },
        function (error, data) {
            //results of the asynchronous function available on data parameter
            ...
        })
    );
```

Then the pipe will wait for function to complete before continuing:
```js
gulp.src('test/*')
    .pipe(asyncPipe(
        ...
    )
    .on('finish', function(){
        //pipe will not finish before the results of the asynchronous function are available
        ...
    });
```
-

*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*.