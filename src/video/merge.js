'use strict';
var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');
var os = require('os');

/**
 * Merges the subtitle and video files into a Matroska Multimedia Container.
 * @param {Object} config
 * @param {string} rtmpInputPath
 * @param {string} filePath
 * @param {function(Error)} done
 */
module.exports = function(config, rtmpInputPath, filePath, done) {
  var subtitlePath = filePath + '.' + config.format;
  var videoPath = filePath + path.extname(rtmpInputPath);
  childProcess.exec(_command() + ' ' +
    '-o "' + filePath + '.mkv" ' +
    '"' + videoPath + '" ' +
    '"' + subtitlePath + '"', {
    maxBuffer: Infinity
  }, function(err) {
    if (err) return done(err);
    fs.unlink(videoPath, function(err) {
      if (err) return done(err);
      fs.unlink(subtitlePath, done);
    });
  });
};

/**
 * Determines the command for the operating system.
 * @private
 * @returns {string}
 */
function _command() {
  if (os.platform() !== 'win32') return 'mkvmerge';
  return path.join(__dirname, '../../bin/mkvmerge.exe');
}
