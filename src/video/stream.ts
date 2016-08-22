'use strict';
import childProcess = require('child_process');
import path = require('path');
import os = require('os');

/**
 * Streams the video to disk.
 */
 export default function(rtmpUrl: string, rtmpInputPath: string, swfUrl: string, filePath: string, fileExt: string, mode: string, done: (err: Error) => void) {
 	if (mode == "RTMP")
 	{
     	childProcess.exec(command("rtmpdump") + ' ' +
        		'-r "' + rtmpUrl + '" ' +
 			'-y "' + rtmpInputPath + '" ' +
 			'-W "' + swfUrl + '" ' +
 			'-o "' + filePath + fileExt + '"', {
 				maxBuffer: Infinity
 			}, done);
 	}
 	else if (mode == "HLS")
 	{
 		console.info("Experimental FFMPEG, MAY FAIL!!!");
 		var cmd=command("ffmpeg") + ' ' + 
 			'-i "' + rtmpInputPath + '" ' + 
 			'-c copy -bsf:a aac_adtstoasc ' + 
 			'"' + filePath + '.mp4"';
 		childProcess.exec(cmd, {
 				maxBuffer: Infinity
 			}, done);
 	}
 	else
 	{
 		console.error("No such mode: " + mode);
 	}
}

/**
 * Determines the command for the operating system.
 */
function command(exe: string): string {
  if (os.platform() !== 'win32') return exe;
  return '"' + path.join(__dirname, '../../bin/' + exe + '.exe') + '"';
}
