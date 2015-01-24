'use strict';
var src = require('./src');

src.batch(process.argv, function(err) {
  if (err) return console.error(err.stack || err);
});
