'use strict';
import batch = require('./batch');

batch(process.argv, (err: any) => {
  if (err) console.error(err.stack || err);
});