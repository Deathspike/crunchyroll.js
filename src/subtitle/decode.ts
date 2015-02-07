/* tslint:disable:no-bitwise false */
'use strict';
export = main;
import crypto = require('crypto');
import bigInt = require('big-integer');
import zlib = require('zlib');

/**
 * Decodes the data.
 */
function main(id: number, iv: Buffer|string, data: Buffer|string, done: (err?: Error, result?: Buffer) => void) {
  try {
    decompress(decrypt(id, iv, data), done);
  } catch (e) {
    done(e);
  }
}

/**
 * Decrypts the data.
 */
function decrypt(id: number, iv: Buffer|string, data: Buffer|string) {
  var ivBuffer = typeof iv === 'string' ? new Buffer(iv, 'base64') : iv;
  var dataBuffer = typeof data === 'string' ? new Buffer(data, 'base64') : data;
  var decipher = crypto.createDecipheriv('aes-256-cbc', key(id), ivBuffer);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(dataBuffer), decipher.final()]);
}

/**
 * Decompresses the data.
 */
function decompress(data: Buffer, done: (err: Error, result?: Buffer) => void) {
  try {
    zlib.inflate(data, done);
  } catch (e) {
    done(null, data);
  }
}

/**
 * Generates a key.
 */
function key(subtitleId: number): Buffer {
  var hash = secret(20, 97, 1, 2) + magic(subtitleId);
  var result = new Buffer(32);
  result.fill(0);
  crypto.createHash('sha1').update(hash).digest().copy(result);
  return result;
}

/**
 * Generates a magic number.
 */
function magic(subtitleId: number): number {
  var base = Math.floor(Math.sqrt(6.9) * Math.pow(2, 25));
  var hash = bigInt(base).xor(subtitleId).toJSNumber();
  var multipliedHash = bigInt(hash).multiply(32).toJSNumber();
  return bigInt(hash).xor(hash >> 3).xor(multipliedHash).toJSNumber();
}

/**
 * Generates a secret string based on a Fibonacci sequence.
 */
function secret(size: number, modulo: number, firstSeed: number, secondSeed: number): string {
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