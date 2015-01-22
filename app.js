'use strict';

// TODO: Improve SRT support for <i>, <b> and <u>.
// TODO: Add ASS support.
// TODO: Add muxing (MP4+ASS=MKV).
// TODO: Add series API to download an entire series rather than per-episode.
// TODO: Add batch-mode to queue a bunch of series and do incremental downloads.
// TODO: Add authentication to the entire stack to support premium content.
// TODO: Add CLI interface with all the options.

var config = {
	format: undefined, // defaults to srt
	path: undefined, // defaults to process.cwd()
	tag: undefined,  // defaults to CrunchyRoll
};

var episode = require('./src/episode');
episode(
	config,
	'http://www.crunchyroll.com/fairy-tail/episode-1-the-dragon-king-652167',
	function(err) {
	if (err) return console.log(err);
	console.log('All done!');
});
