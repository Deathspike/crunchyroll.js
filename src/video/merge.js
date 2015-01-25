'use strict';
var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');
var os = require('os');
var subtitle = require('../subtitle');

/**
 * Merges the subtitle and video files into a Matroska Multimedia Container.
 * @param {Object} config
 * @param {string} rtmpInputPath
 * @param {string} filePath
 * @param {function(Error)} done
 */
module.exports = function(config, rtmpInputPath, filePath, done) {
  var format = subtitle.formats[config.format] ? config.format : 'ass';
  var subtitlePath = filePath + '.' + format;
  var videoPath = filePath + path.extname(rtmpInputPath);
  childProcess.exec(_command() + ' ' +
    '-o "' + filePath + '.mkv" ' +
    '"' + videoPath + '" ' +
    '"' + subtitlePath + '"', {
    maxBuffer: Infinity
  }, function(err) {
    if (err) return done(err);
    _unlink(videoPath, subtitlePath, function(err) {
      if (err) _unlinkTimeout(videoPath, subtitlePath, 5000);
      done();
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

/**
 * Unlinks the video and subtitle.
 * @private
 * @param {string} videoPath
 * @param {string} subtitlePath
 * @param {function(Error)} done
 */
function _unlink(videoPath, subtitlePath, done) {
  fs.unlink(videoPath, function(err) {
    if (err) return done(err);
    fs.unlink(subtitlePath, done);
  });
}

/**
 * Attempts to unlink the video and subtitle with a timeout between each try.
 * @private
 * @param {string} videoPath
 * @param {string} subtitlePath
 * @param {function(Error)} done
 */
function _unlinkTimeout(videoPath, subtitlePath, timeout) {
  console.log('Trying to unlink...' + Date.now());
  setTimeout(function() {
    _unlink(videoPath, subtitlePath, function(err) {
      if (err) _unlinkTimeout(videoPath, subtitlePath, timeout);
    });
  }, timeout);
}
