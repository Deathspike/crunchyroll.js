'use strict';
var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');
var isTest = process.argv[2] === '--only-test';

// TODO: This build task should be removed upon release of TypeScript 1.5 with
// the support for `tsconfig.json`. Invoking `tsc` from `package.json` will then
// read the configuration and compile accordingly. It seems that `TSLint` will,
// eventually, support this mechanism too. That prevents the need for any kind
// of build task and will run entirely based on instructions from `npm`.
//
// Reference #1: https://github.com/Microsoft/TypeScript/issues/1667
// Reference #2: https://github.com/palantir/tslint/issues/281

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
  if (isTest) return done();
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
  if (isTest) return done(null);
  var execPath = path.join(__dirname, 'node_modules/.bin/tsc');
  var options = '--declaration --module CommonJS --noImplicitAny --outDir dist --target ES5';
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
  done(null, JSON.parse(fs.readFileSync('tsconfig.json', 'utf8')).files);
}
