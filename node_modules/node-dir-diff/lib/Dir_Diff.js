var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var Gate = require('gate');
var Catalog = require('./Catalog');
var filecompare = require('filecompare');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function _sum(data) {
	return _.reduce(data, function (t, v) {
		return t + v;
	}, 0);
}
/**
 *
 * @param dirs [{string}]
 * @param comp_mode {string} == 'list' or 'content';
 * @constructor
 */
function Dir_Diff(dirs, comp_mode) {
	this.dirs = dirs || [];
	this._comps = [];
	this.comp_mode = comp_mode || 'list';
}

Dir_Diff.prototype = {
	compare: function (dirs, cb) {
		if (_.isFunction(dirs)) {
			cb = dirs;
		} else if (_.isArray(dirs)) {
			this.dirs = dirs;
		}

		var gate = Gate.create();

		this.dirs.forEach(function (dir) {
			var cat = new Catalog(dir);
			this._comps.push(cat);
			cat.scan(gate.latch());
		}, this);

		gate.await(_.bind(function () {
			var files = _.reduce(this._comps, function (out, comp) {
				out[comp.dir] = _.map(comp.files, function (file) {
					return file.substr(comp.dir.length);
				});
				return out;
			}, {}, this);

			var dirs = _.reduce(this._comps, function (out, comp) {
				out[comp.dir] = _.map(comp.dirs, function (dir) {
					return dir.substr(comp.dir.length);
				});
				return out;
			}, {});

			var common_files = _.reduce(files, function (common, files, index) {
				//		console.log('common files between %s and %s (%s)', util.inspect(common), util.inspect(files), index)
				return _.intersection(common, files);
			});

			//	console.log('common: %s', util.inspect(common_files));

			var base_comp_dir = this._comps[0].dir;
			var bcd_files = files[base_comp_dir];
			delete files[base_comp_dir];

			var bdd_dirs = dirs[base_comp_dir];
			delete dirs[base_comp_dir];

			var file_status = _.map(files, function (list, file_path) {

				var missing_files = _.map(_.difference(list, bcd_files), function (file) {
					return path.resolve(file_path, file);
				});

				var added_files = _.map(_.difference(bcd_files, list), function (file) {
					return path.resolve(file_path, file);
				});

				return {dir:   file_path,
					missing:   missing_files,
					added:     added_files,
					deviation: missing_files.length + added_files.length
				};
			});

			var dir_status = _.map(dirs, function (list, file_path) {
				var missing_files = _.difference(list, bdd_dirs);

				var added_files = _.difference(bdd_dirs, list);

				return {dir:   file_path,
					missing:   missing_files,
					added:     added_files,
					deviation: missing_files.length + added_files.length
				};
			});

			file_status.unshift({
				dir:       base_comp_dir,
				deviation: 0,
				added:     [],
				missing:   []
			});
			dir_status.unshift({
				dir:       base_comp_dir,
				deviation: 0,
				added:     [],
				missing:   []
			});

			var deviation = _sum(_.pluck(file_status, 'deviation'));
			deviation += _sum(_.pluck(dir_status, 'deviation'));

			var added = _.reduce(file_status, function (out, status) {
				return out.concat(_.map(status.added, function (file) {
					return {type: 'file', subpath: file, root: status.dir, path: path.join(status.dir, file)}
				}));
			}, []);

			added = _.reduce(dir_status, function (out, status) {
				return out.concat(_.map(status.added, function (file) {
					return {type: 'dir', subpath: file, root: status.dir, path: path.join(status.dir, file)}
				}));
			}, added);

			var missing = _.reduce(file_status, function (out, status) {
				return out.concat(_.map(status.missing, function (file) {
					return {type: 'missing', subpath: file, root: status.dir, path: path.join(status.dir, file)}
				}));
			}, []);

			missing = _.reduce(dir_status, function (out, status) {
				return out.concat(_.map(status.missing, function (file) {
					return {type: 'dir', subpath: file, root: status.dir, path: path.join(status.dir, file)}
				}));
			}, missing);

			var summary = {
				root_dirs:    this.dirs,
				dirs:         dirs,
				file_status:  file_status,
				dir_status:   dir_status,
				deviation:    deviation,
				deviations:   [],
				common_files: common_files,
				added:        added,
				missing:      missing
			};

			added.forEach(function (file) {
				summary.deviations.push({
					type:    'unique_file_path',
					info:    file.path,
					variant: 'added'
				})
			});
			missing.forEach(function (file) {
				summary.deviations.push({
					type:    'unique_file_path',
					info:    file.path,
					variant: 'missing'
				})
			});

			if (this.comp_mode == 'list') {
				cb(null, summary)
			} else {
				this.comp_content(summary, cb);
			}
		}, this));
	},

	comp_content: function (summary, cb) {
		var gate = Gate.create();
		var self = this;

		var common_file_info = _.map(summary.root_dirs, function (dir) {
				return {
					dir:               dir,
					common_file_stats: {},
					common_files:      _.map(summary.common_files, function (file) {
						return {
							subpath:   file,
							root_dir:  dir,
							full_path: path.join(dir, file)
						}
					})
				}
			}
		);

		summary.common_file_info = common_file_info;

		_.each(common_file_info, function (file_info) {

			file_info.common_files.forEach(function (file) {
				var l = gate.latch();
				fs.stat(file.full_path, function (err, s) {
					file_info.common_file_stats[file.subpath] = s;
					file.stat = s;
					l();
				})
			});

		});

		gate.await(function () {

			var file_size_report = _.flatten(_.pluck(common_file_info, 'common_files'));
			var report_by_path = _.groupBy(file_size_report, 'subpath');
			summary.file_size_report = file_size_report;
			summary.report_by_path = report_by_path;

			summary.common_file_info = common_file_info;
			summary.file_size_difference = [];
			summary.file_size_same = [];

			_.each(report_by_path, function (data, subpath) {
				if (_DEBUG) console.log('... subpath: %s', subpath);
				var sizes = _.uniq(_.map(data, function (report) {
					return report.stat.size;
				}));
				if (_DEBUG) console.log('subpath: %s, sizes: %s', subpath, sizes.join(','));
				if (sizes.length > 1) {
					if (_DEBUG)    console.log('deviation!!!')
					++summary.deviation;
					var info = _.reduce(data, function (out, item) {
						out[item.full_path] = item.stat.size;
						return out;
					}, {});
					summary.deviations.push({
						type: 'file_size',
						info: info
					});
					data.size_deviation = true;
					summary.file_size_difference.push(info)
				} else {
					summary.file_size_same.push(subpath);
				}
			});
			if (self.comp_mode == 'size') {
				cb(null, summary);
			} else if (self.comp_mode == 'ful') {
				cb(null, summary);
			} else {
				var same_size_files = _.groupBy(_.flatten(_.map(summary.file_size_same, function (subpath) {
					return report_by_path[subpath]
				})), 'subpath');

				var gate2 = Gate.create();

				summary.file_content_difference = [];

				if (_DEBUG)    console.log('same size data: %s', util.inspect(same_size_files));

				_.each(same_size_files, function (data, file_def) {
					var base_file = '';
					data.forEach(function (def, index) {
						if (index == 0) {
							base_file = def.full_path;
						} else {
							var l = gate2.latch();
							filecompare(def.full_path, base_file, function (equal) {
								if (!equal) {
									summary.file_content_difference.push(def);
									summary.deviations.push({
										type: 'file_content',
										info: {subpath: def.subpath, root_dir: def.root_dir, full_path: def.full_path}
									});

									++summary.deviation;
								}
								l();
							});
						}
					});
				});

				gate2.await(function () {
					cb(null, summary);
				})
			}
		})

	}
};

/* ********* EXPORTS ******** */

module.exports = Dir_Diff;