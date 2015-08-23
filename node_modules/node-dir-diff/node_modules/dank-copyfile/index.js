var fs = require('fs');

if (process.argv[1] === __filename) {
	copyFile(process.argv[2], process.argv[3], function () {
		console.log(arguments);
	});
}

module.exports = copyFile;

function copyFile (from, to, callback) {
	var source, destination, calledBack = false, errors = [], tmpTo;
	
	if (!(from && to)) {
		return callback(Error('Source and destination arguments are required to copyFile.'));
	}
	
	callback = callback || function () {};
	tmpTo = to + '.part';
	
	source = fs.createReadStream(from);
	destination = fs.createWriteStream(tmpTo);
	
	source.on('end', function () {
		source.destroy();
		destination.destroySoon();
	});
	
	source.on('close', maybeCallback);
	source.on('error', handleError);
	
	destination.on('close', maybeCallback);
	destination.on('error', handleError);
	
	source.pipe(destination);
	
	function handleError(err) {
		if (err) {
			errors.push(err);
			
			source.destroy();
			destination.destroy();
		}
	}
	
	function maybeCallback() {
		if (calledBack) {
			return;
		}
		
		if (errors.length) {
			calledBack = true;
			
			fs.unlink(tmpTo, function (err) {
				callback(errors[0]);
			});
		}
		else if (!source.readable && !destination.writable) {
			calledBack = true;
			
			fs.rename(tmpTo, to, callback);
		}
	}
}