var loader = require('hive-loader');
var Handler = loader.handler;
var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

var _mixins = {name: 'txt_handler', respond: function (params) {
	if (_DEBUG) console.log(' responding to %s', params.file);
	this.files.push(params.file_path);
}};

module.exports = function (config, cb) {

	return Handler(
		_mixins,
		[
			config,
			{name_filter: /.*/}
		]
		, cb);
}