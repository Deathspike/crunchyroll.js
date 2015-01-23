'use strict';
var xml2js = require('xml2js');

/**
 * Converts an input buffer to a SubRip subtitle.
 * @param {Buffer|string} input
 * @param {function(Error, string=)} done
 */
module.exports = function(input, done) {
  if (typeof buffer !== 'string') input = input.toString();
  xml2js.parseString(input, {
    explicitArray: false,
    explicitRoot: false
  }, function(err, xml) {
    try {
      if (err) return done(err);
      done(undefined, xml.events.event.map(_event).join('\n'));
    } catch(err) {
      done(err);
    }
  });
};

/**
 * Converts an event.
 * @private
 * @param {Object} event
 * @param {number} index
 * @returns {string}
 */
function _event(event, index) {
  var attributes = event.$;
  return (index + 1) + '\n' +
    _time(attributes.start) + ' --> ' + _time(attributes.end) + '\n' +
    _text(attributes.text) + '\n';
}

/**
 * Prefixes a value.
 * @private
 * @param {string} value
 * @param {number} length
 * @returns {string}
 */
function _prefix(value, length) {
  while (value.length < length) value = '0' + value;
  return value;
}

/**
 * Suffixes a value.
 * @private
 * @param {string} value
 * @param {number} length
 * @returns {string}
 */
function _suffix(value, length) {
  while (value.length < length) value = value + '0';
  return value;
}

/**
 * Formats a text value.
 * @private
 * @param {string} text
 * @returns {string}
 */
function _text(text) {
  return text
    .replace(/{\\i1}/g, '<i>').replace(/{\\i0}/g, '</i>')
    .replace(/{\\b1}/g, '<b>').replace(/{\\b0}/g, '</b>')
    .replace(/{\\u1}/g, '<u>').replace(/{\\u0}/g, '</u>')
    .replace(/{[^}]+}/g, '')
    .replace(/(\s+)?\\n(\s+)?/ig, '\n')
    .trim();
}

/**
 * Formats a time stamp.
 * @private
 * @param {string} time
 * @returns {string}
 */
function _time(time) {
  var all = time.match(/^([0-9]+):([0-9]+):([0-9]+)\.([0-9]+)$/);
  if (!all) throw new Error('Invalid time.');
  var hours = _prefix(all[1], 2);
  var minutes = _prefix(all[2], 2);
  var seconds = _prefix(all[3], 2);
  var milliseconds = _suffix(all[4], 3);
  return hours + ':' + minutes + ':' + seconds + ',' + milliseconds;
}
