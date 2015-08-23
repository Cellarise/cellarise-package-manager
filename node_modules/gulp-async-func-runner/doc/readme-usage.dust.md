## Usage

This gulp task expects an options object, an asynchronous function and a callback function. The task runs the asynchronous function passing it the options, a chunk of data, and the callback function.

### As a gulp task

Use the task to execute an asynchronous function within a gulp pipe.

```js
var asyncPipe = require('{name}');
gulp.src('test/*')
    .pipe(asyncPipe(
        opts,
        asyncFunc,
        callback)
    );
```
