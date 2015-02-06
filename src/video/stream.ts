'use strict';
export = main;
import childProcess = require('child_process');
import path = require('path');
import os = require('os');

/**
 * Streams the video to disk.
 */
function main(rtmpUrl: string, rtmpInputPath: string, swfUrl: string, filePath: string, done: (err: Error) => void) {
  childProcess.exec(command() + ' ' +
    '-r "' + rtmpUrl + '" ' +
    '-y "' + rtmpInputPath + '" ' +
    '-W "' + swfUrl + '" ' +
    '-o "' + filePath + '"', {
      maxBuffer: Infinity
    }, done);
}

/**
 * Determines the command for the operating system.
 */
function command(): string {
  if (os.platform() !== 'win32') return 'rtmpdump';
  return path.join(__dirname, '../../bin/rtmpdump.exe');
}