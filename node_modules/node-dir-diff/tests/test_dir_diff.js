var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var ndd = require('./../index');

var _DEBUG = false;

/* *********************** TEST SCAFFOLDING ********************* */

var root = path.resolve(__dirname, '../test_resources');

/* ************************* TESTS ****************************** */

tap.test('test_dir_diff', function (t) {

	var dd = new ndd.Dir_Diff(
		[
			path.resolve(root, 'test_1'),
			path.resolve(root, 'test_2')
		]
	);

	dd.compare(function (err, result) {
		//	console.log('result: %s', util.inspect(result, true, 5));

		t.equals(result.deviation, 3, 'deviation is 3');

		t.deepEqual(result.missing, [
			{
				type:    'missing',
				subpath: '/bar/wilma.txt',
				"root":  "/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_2",
				path:    root + '/test_2/bar/wilma.txt'
			},
			{
				"type":  "dir",
				subpath: '/bar/underwear',
				"root":  "/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_2",
				"path":  root + "/test_2/bar/underwear"
			}
		], 'missing files');

		t.deepEqual(result.common_files, [ '/bar/barney.txt',
			'/bar/Fred.txt',
			'/foo/Barney.txt',
			'/foo/Moe.txt',
			'/bar/clothes/blue_fir.json',
			'/bar/clothes/red_fur.json' ], 'files in common');

		t.deepEqual(result.added, [
			{
				type:    'file',
				subpath: "/bar/clothes/white_fir.json",
				"root":  "/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_2",
				path:    root + '/test_2/bar/clothes/white_fir.json'
			}
		]);

		t.deepEqual(result.deviations, [
			{ type:      'unique_file_path',
				info:    root + '/test_2/bar/clothes/white_fir.json',
				variant: 'added' },
			{ type:      'unique_file_path',
				info:    root + '/test_2/bar/wilma.txt',
				variant: 'missing' },
			{ type:      'unique_file_path',
				info:    root + '/test_2/bar/underwear',
				variant: 'missing' }
		]);

		t.end();
	})

});

tap.test('test_dir_diff(size)', function (t) {

	var dd = new ndd.Dir_Diff(
		[
			path.resolve(root, 'test_1'),
			path.resolve(root, 'test_2')
		],
		'size'
	);

	dd.compare(function (err, result) {

		if (_DEBUG) console.log('deep compare/file_size_difference: %s', util.inspect(result.file_size_difference, true, 5));

		var expected = {};
		expected [root + '/test_1/bar/barney.txt'] = 11;
		expected [root + '/test_2/bar/barney.txt'] = 31;
		t.deepEqual(result.file_size_difference, [expected], "expected detects the difference in barney size")
		t.equals(result.deviation, 4, 'deviation is 4');

		var fs_info = {};

		fs_info[root + '/test_1/bar/barney.txt'] = 11;
		fs_info[root + '/test_2/bar/barney.txt'] = 31;

		t.deepEqual(result.deviations, [
			{ type:      'unique_file_path',
				info:    root + '/test_2/bar/clothes/white_fir.json',
				variant: 'added' },
			{ type:      'unique_file_path',
				info:    root + '/test_2/bar/wilma.txt',
				variant: 'missing' },
			{ type:      'unique_file_path',
				info:    root + '/test_2/bar/underwear',
				variant: 'missing' },
			{ type:   'file_size',
				info: fs_info }
		]);
		t.end();
	})

});

tap.test('test_dir_diff(full) -- three dirs', function (t) {

		var dd = new ndd.Dir_Diff(
			[
				path.resolve(root, 'test_1'),
				path.resolve(root, 'test_2'),
				path.resolve(root, 'test_3')
			],
			'full'
		);

		dd.compare(function (err, result) {

			if (_DEBUG) console.log('full compare - three files: %s', util.inspect(result, true, 5));

			var diff_subpaths = _.pluck(result.file_content_difference, 'subpath');
			t.deepEqual(diff_subpaths, ['/foo/Moe.txt'], "detects difference in Moe Sislak (hyphen)")
			t.equals(result.deviation, 6, 'deviation is 6');

			var fs_info = {};

			fs_info[root + '/test_1/bar/barney.txt'] = 11;
			fs_info[root + '/test_2/bar/barney.txt'] = 31;

			console.log('deviations (3): ', JSON.stringify(result, true, 4));

			t.deepEqual(result.deviations, [
				{ type:      'unique_file_path',
					info:    '/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_2/bar/clothes/white_fir.json',
					variant: 'added' },
				{ type:      'unique_file_path',
					info:    '/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_3/bar/barney.txt',
					variant: 'added' },
				{ type:      'unique_file_path',
					info:    '/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_2/bar/wilma.txt',
					variant: 'missing' },
				{ type:      'unique_file_path',
					info:    '/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_2/bar/underwear',
					variant: 'missing' },
				{ type:      'unique_file_path',
					info:    '/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_3/bar/clothes/gloves',
					variant: 'missing' },
				{ type:   'file_content',
					info: { subpath: '/foo/Moe.txt',
						root_dir:    '/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_2',
						full_path:   '/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_2/foo/Moe.txt' } }
			]);

			t.end();
		})


});
