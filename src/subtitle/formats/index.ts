'use strict';
export = main;
import ass = require('./ass');
import srt = require('./srt');
import typings = require('../../typings');

var main: typings.IFormatterTable = {
  ass: ass,
  srt: srt
};
