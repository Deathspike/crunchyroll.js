'use strict';
export = srt;
import xml2js = require('xml2js');
import typings = require('../../typings');

/**
 * Converts an input buffer to a SubRip subtitle.
 */
function srt(input: Buffer|string, done: (err: Error, subtitle?: string) => void) {
  var options = {explicitArray: false, explicitRoot: false};
  xml2js.parseString(input.toString(), options, (err: Error, xml: typings.ISubtitle) => {
    try {
      if (err) return done(err);
      done(null, xml.events.event.map((event, index) => {
        var attributes = event.$;
        return (index + 1) + '\n' +
          time(attributes.start) + ' --> ' + time(attributes.end) + '\n' +
          text(attributes.text) + '\n';
      }).join('\n'));
    } catch (err) {
      done(err);
    }
  });
}

/**
 * Prefixes a value.
 */
function prefix(value: string, length: number): string {
  while (value.length < length) value = '0' + value;
  return value;
}

/**
 * Suffixes a value.
 */
function suffix(value: string, length: number): string {
  while (value.length < length) value = value + '0';
  return value;
}

/**
 * Formats a text value.
 */
function text(value: string): string {
  return value
    .replace(/{\\i1}/g, '<i>').replace(/{\\i0}/g, '</i>')
    .replace(/{\\b1}/g, '<b>').replace(/{\\b0}/g, '</b>')
    .replace(/{\\u1}/g, '<u>').replace(/{\\u0}/g, '</u>')
    .replace(/{[^}]+}/g, '')
    .replace(/(\s+)?\\n(\s+)?/ig, '\n')
    .trim();
}

/**
 * Formats a time stamp.
 */
function time(value: string): string {
  var all = value.match(/^([0-9]+):([0-9]+):([0-9]+)\.([0-9]+)$/);
  if (!all) throw new Error('Invalid time.');
  var hours = prefix(all[1], 2);
  var minutes = prefix(all[2], 2);
  var seconds = prefix(all[3], 2);
  var milliseconds = suffix(all[4], 3);
  return hours + ':' + minutes + ':' + seconds + ',' + milliseconds;
}