'use strict';
var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');

read(function(err, fileNames) {
  clean(fileNames, function() {
    var hasLintError = false;
    compile(fileNames, function(err) {
      if (err) {
        console.error(err);
        return process.exit(1);
      }
      lint(fileNames, function(message) {
        process.stdout.write(message);
        hasLintError = true;
      }, function() {
        process.exit(Number(hasLintError));
      });
    });
  });
});

/**
 * Clean the files.
 * @param {Array.<string>} filePaths
 * @param {function()} done
 */
function clean(filePaths, done) {
  var i = -1;
  (function next() {
    i += 1;
    if (i >= filePaths.length) return done();
    var filePath = filePaths[i];
    if (/\.d\.ts$/.test(filePath)) return next();
    var mapName = filePath.substring(4, filePath.length - 2) + 'js.map';
    var mapPath = path.join('dist', mapName);
    if (fs.existsSync(mapPath)) fs.unlinkSync(mapPath);
    next();
  })();
}

/**
 * Compile the files.
 * @param {Array.<string>} filePaths
 * @param {function(Error)} done
 */
function compile(filePaths, done) {
  var execPath = path.join(__dirname, 'node_modules/.bin/tsc');
  var options = '--declaration --module CommonJS --noImplicitAny --outDir dist';
  childProcess.exec([execPath, options].concat(filePaths).join(' '), function(err, stdout) {
      if (stdout) return done(new Error(stdout));
      done(null);
    });
}

/**
 * Lint the files.
 * @param {Array.<string>} filePaths
 * @param {function(string)} handler
 * @param {function()} done
 */
function lint(filePaths, handler, done) {
  var i = -1;
  var execPath = path.join(__dirname, 'node_modules/.bin/tslint');
  (function next() {
    i += 1;
    if (i >= filePaths.length) return done();
    var filePath = filePaths[i];
    if (/\.d\.ts$/.test(filePath)) return next();
    childProcess.exec(execPath + ' -f ' + filePath, function(err, stdout) {
      if (stdout) handler(stdout);
      next();
    });
  })();
}

/**
 * Read the files from the project file.
 * @param {function(Error, Array.<string>)} done
 */
function read(done) {
  var contents = fs.readFileSync('crunchyroll.js.njsproj', 'utf8');
  var expression = /<TypeScriptCompile\s+Include="([\w\W]+?\.ts)" \/>/g;
  var matches;
  var filePaths = [];
  while ((matches = expression.exec(contents))) filePaths.push(matches[1]);
  done(null, filePaths);
}