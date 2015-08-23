node-dir-diff
=============

A directory comparison system using hive-loader/node.js. Compares two or more directories.

The comparisons have three possible "depths":

1) path only -- checks the file/directory paths for added or missing files, but ignores content (comp == 'list');
2) size -- does a stat, and notes files that are the same name, but different sizes. (comp = 'size')
3) content -- compares file content on a byte level (using the filecompare module). (comp = 'full')

Note that tests that fail a simpler test will not be subjected to higher tests;
that is, if a file is not found in all
the directories you pass in, the instances of it that do exist will not be compared by size/content.

Usage
-----

To compare two or more directories, simply call

<code>

	var dd = new ndd.Dir_Diff(
		[
			path.resolve(root, 'test_1'),
			path.resolve(root, 'test_2'),
			path.resolve(root, 'test_3')
		],
		'full'
	);

	dd.compare(function (err, result) {
	if (result.deviation > 0){
		console.log('you have %s deviations!', result.deviation);
		console.log(util.inspect(deviation));
	}
});
</code>

Any number of directories can be passed in; if the comparison mode is omitted, 'list' is assumed.

The first item in the list is taken as the "normal" directory; this won't affect deviations, but it does explain
what the basis is for report elements like "added" or "missing".

Output
------

The feedback to the callback is a report object:

<code>
		{
			root_dirs:    [the input to dir_diff],
			added:		  [info]
			dirs:         {dir_hash}
			file_status:  [file-dir-status],
			dir_status:   [file-dir-status],
			deviation:    posint,
			deviations:   [deviation-report],
			common_files: common_files,
			added:        added,
			missing:      missing
		};
</code>

Most of the report is work product; the deviation and deviations properties are the most significant elements of the
report.

where info is

<code>
 	{
 		subpath: string (relative to root dir),
 		path:    string (absolute pate to file),
 		type:    string ('file' or 'dir'),
 		root:    string (the root dir)
 	}
</code>

dir-hash is

<code>
	{
		'root_dir': ['dir paths...'],
		...
		'root_dir': ['dir paths...']
	}
</code>

file-dir-status is
<code>
	[{dir: 'root_dir',
	 devaition: posint,
	 added:[ 'subpath'... 'subpath']
	 missing: ['subpath' ... 'subpath']
	 } ... {}]
</code>

deviation-report is
<code>
	{
		"type":    "string",
		"info":    "string" | info,
		"variant": "added" | "removed" (optional);
	}

</code>

see the "sample outpuut.json" file in test resources.