'use strict';
var config = {
	format: 'ass', 			 // defaults to srt
	merge: true, 				 // defaults to false
	path: 'F:\\Anime', 	 // defaults to process.cwd(),
	title: 'Fairy Tail', // defaults to series title.
	tag: undefined,  		 // defaults to CrunchyRoll
};

/*var episode = require('./src/episode');
episode(
	config,
	'http://www.crunchyroll.com/fairy-tail/episode-1-the-dragon-king-652167',
	function(err) {
	if (err) return console.log(err);
	console.log('All done!');
});*/

var series = require('./src/series');
series(
	config,
	'http://www.crunchyroll.com/fairy-tail',
	function(err) {
		if (err) return console.log(err.stack || err);
		console.log('All done!');
});
