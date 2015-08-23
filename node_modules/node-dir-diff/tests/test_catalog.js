var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var ndd = require('./../index');

var _DEBUG = false;

/* *********************** TEST SCAFFOLDING ********************* */

var root = path.resolve(__dirname, '../test_resources');

/* ************************* TESTS ****************************** */

	tap.test('test catalog', function (t) {

		var catalog = new ndd.Catalog(path.resolve(root, 'test_1'));

		catalog.scan(function () {
			if (_DEBUG) console.log('catalog: %s', util.inspect(catalog, true, 4));

			t.deepEqual(catalog.files, [
				'/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_1/bar/barney.txt',
				'/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_1/bar/Fred.txt',
				'/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_1/foo/Barney.txt',
				'/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_1/foo/Moe.txt',
				'/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_1/bar/clothes/blue_fir.json',
				'/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_1/bar/clothes/red_fur.json',
				"/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_1/bar/clothes/white_fir.json"
			], 'found all files');
			t.deepEqual(catalog.dirs,
				[ '/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_1/bar',
					'/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_1/foo',
					"/Users/dedelhart/Documents/node/node-dir-diff/test_resources/test_1/bar/clothes"
				], 'found all dirs');
			t.end();
		})

	});