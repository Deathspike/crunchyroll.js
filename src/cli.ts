'use strict';
import batch = require('./batch');

batch(process.argv, err => {
  if (err) console.error(err);
});