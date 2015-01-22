'use strict';
var crypto = require('crypto');
var bigInt = require('big-integer');
var zlib = require('zlib');

/**
 * Decodes the data.
 * @param {number} id
 * @param {(Buffer|string)} iv
 * @param {(Buffer|string)} data
 * @param {function(Error, Buffer=)} done
 */
module.exports = function(id, iv, data, done) {
  try {
    _decompress(_decrypt(id, iv, data), done);
  } catch(e) {
    done(e);
  }
};

/**
 * Decrypts the data.
 * @private
 * @param {number} id
 * @param {(Buffer|string)} iv
 * @param {(Buffer|string)} data
 * @return {Buffer}
 */
function _decrypt(id, iv, data) {
  if (typeof iv === 'string') iv = new Buffer(iv, 'base64');
  if (typeof data === 'string') data = new Buffer(data, 'base64');
  var decipher = crypto.createDecipheriv('aes-256-cbc', _key(id), iv);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

/**
 * Decompresses the data.
 * @private
 * @param {Buffer} data
 * @param {function(Error, Buffer=)} done
 */
function _decompress(data, done) {
  try {
    zlib.inflate(data, done);
  } catch(e) {
    done(undefined, data);
  }
}

/**
 * Generates a key.
 * @private
 * @param {number} subtitleId
 * @return {Buffer}
 */
function _key(subtitleId) {
  var hash = _secret(20, 97, 1, 2) + _magic(subtitleId);
  var result = new Buffer(32);
  result.fill(0);
  crypto.createHash('sha1').update(hash).digest().copy(result);
  return result;
}

/**
 * Generates a magic number.
 * @private
 * @param {number} subtitleId
 * @return {number}
 */
function _magic(subtitleId) {
  var base = Math.floor(Math.sqrt(6.9) * Math.pow(2, 25));
  var hash = bigInt(base).xor(subtitleId);
  var multipliedHash = bigInt(hash).multiply(32);
  return bigInt(hash).xor(hash >> 3).xor(multipliedHash).toJSNumber();
}

/**
 * Generates a secret string based on a Fibonacci sequence.
 * @private
 * @param {number} size
 * @param {number} modulo
 * @param {number} firstSeed
 * @param {number} secondSeed
 * @return {string}
 */
function _secret(size, modulo, firstSeed, secondSeed) {
  var currentValue = firstSeed + secondSeed;
  var previousValue = secondSeed;
  var result = '';
  for (var i = 0; i < size; i += 1) {
    var oldValue = currentValue;
    result += String.fromCharCode(currentValue % modulo + 33);
    currentValue += previousValue;
    previousValue = oldValue;
  }
  return result;
}
