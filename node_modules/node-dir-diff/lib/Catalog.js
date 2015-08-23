var _ = require('underscore');
var path = require('path');
var util = require('util')

var dir_scanner = require('./loaders/dir_scanner');

function Catalog(config) {
	if (_.isString(config)){
		config = {dir: config};
	}
	_.extend(this, config);
}

Catalog.prototype = {

	scan: function (cb) {
		this.files = [];
		if (!this.dir) {
			throw new Error('no dir defined');
		}

		var loader = dir_scanner({root: this.dir, name_filter: this.name_filter || /.*/});

		var self = this;

		loader.load(function (err) {
			//@todo handle err
			self.files = loader.files;
			self.dirs = loader.dirs;
			cb(err);
		});

	}

};

module.exports = Catalog;