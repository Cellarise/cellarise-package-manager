Usage:
```
var asyncPipe = require('{name}');
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