var loader = require('hive-loader');
var Loader = loader.loader;
var Handler = loader.handler;
var _ = require('underscore');
var path = require('path');
var util = require('util');

var dir_handler = require('./../handlers/dir');
var file_handler = require('./../handlers/file');

function Dir_Scanner(config, cb) {

	var fh = file_handler({name_filter: config.name_filter});
	var dh = dir_handler({});

	return Loader(
		[
			{ files:  [],
				dirs: [],
				name: 'dir_scanner'}
		],
		[
			{
				handlers: [fh, dh]
			},
			config
		],
		function (err, loader) {
			fh.config().set('target', loader);
			dh.config().set('target', loader);
			if (cb) cb(err, loader);
		});
}

module.exports = Dir_Scanner;