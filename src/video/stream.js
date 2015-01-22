'use strict';
var childProcess = require('child_process');
var path = require('path');
var os = require('os');

/**
 * Streams the video to disk using rtmpdump.
 * @param {string} rtmpUrl
 * @param {string} inputPath
 * @param {string} swfUrl
 * @param {string} outputPath
 * @param {function(Error)} done
 */
module.exports = function(rtmpUrl, inputPath, swfUrl, outputPath, done) {
  childProcess.exec(_command() + ' ' +
    '-r "' + rtmpUrl + '" ' +
    '-y "' + inputPath + '" ' +
    '-W "' + swfUrl + '" ' +
    '-o "' + outputPath + '"', {
    maxBuffer: Infinity
  }, done);
};

/**
 * Determines the command for the operating system.
 * @returns {string}
 */
function _command() {
  if (os.platform() !== 'win32') return 'rtmpdump';
  return path.join(__dirname, '../../bin/rtmpdump.exe');
}
