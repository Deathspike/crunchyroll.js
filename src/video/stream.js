'use strict';
var childProcess = require('child_process');
var path = require('path');
var os = require('os');

/**
 * Streams the video to disk.
 * @param {string} rtmpUrl
 * @param {string} rtmpInputPath
 * @param {string} swfUrl
 * @param {string} filePath
 * @param {function(Error)} done
 */
module.exports = function(rtmpUrl, rtmpInputPath, swfUrl, filePath, done) {
  childProcess.exec(_command() + ' ' +
    '-r "' + rtmpUrl + '" ' +
    '-y "' + rtmpInputPath + '" ' +
    '-W "' + swfUrl + '" ' +
    '-o "' + filePath + '"', {
    maxBuffer: Infinity
  }, done);
};

/**
 * Determines the command for the operating system.
 * @private
 * @returns {string}
 */
function _command() {
  if (os.platform() !== 'win32') return 'rtmpdump';
  return path.join(__dirname, '../../bin/rtmpdump.exe');
}
