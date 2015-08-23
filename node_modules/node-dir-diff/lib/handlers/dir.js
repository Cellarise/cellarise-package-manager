var loader = require('hive-loader');
var Handler = loader.handler;
var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

var _mixins = {
	name:    'dir_hander',
	respond: function (params) {
		var latch = params.gate.latch();
		if (_DEBUG) console.log('responding to dir %s', params.file_path);
		this.dirs.push(params.file_path);
		var ds =  dir_scanner = require('./../loaders/dir_scanner')(
			{target: this, name_filter: this.get_config('name_filter')});

		ds.load(latch, params.file_path);
	}
};

module.exports = function (config, cb) {
	return Handler(_mixins, [{dir: true}, config, {name_filter: /.*/}], cb);
}