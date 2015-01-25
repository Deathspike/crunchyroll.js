'use strict';
var xml2js = require('xml2js');

/**
 * Converts an input buffer to a SubStation Alpha subtitle.
 * @param {Buffer|string} input
 * @param {function(Error, string=)} done
 */
module.exports = function(input, done) {
  if (typeof buffer !== 'string') input = input.toString();
  xml2js.parseString(input, {
    explicitArray: false,
    explicitRoot: false
  }, function(err, xml) {
    if (err) return done(err);
    try {
      done(undefined, _script(xml) + '\n' +
        _style(xml.styles) + '\n' +
        _event(xml.events));
    } catch(err) {
      done(err);
    }
  });
};

/**
 * Converts the event block.
 * @param {Object} events
 * @returns {string}
 */
function _event(events) {
  var format = 'Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text';
  var items = [].concat(events.event).map(function(style) {
    return _values(style.$, 'Dialogue: 0,{start},{end},{style},{name},' +
      '{margin_l},{margin_r},{margin_v},{effect},{text}');
  });
  return '[Events]\n' +
    'Format: ' + format + '\n' +
    items.join('\n') + '\n';
}

/**
 * Converts the script block.
 * @param {Object} script
 * @returns {string}
 */
function _script(script) {
  return _values(script.$,
    '[Script Info]\n' +
    'Title: {title}\n' +
    'ScriptType: v4.00+\n' +
    'WrapStyle: {wrap_style}\n' +
    'PlayResX: {play_res_x}}\n' +
    'PlayResY: {play_res_y}\n' +
    'Subtitle ID: {id}\n' +
    'Language: {lang_string}\n' +
    'Created: {created}\n');
}

/**
 * Converts the style block.
 * @param {Object} styles
 * @returns {string}
 */
function _style(styles) {
  var format = 'Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,' +
    'OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,' +
    'ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,' +
    'MarginL,MarginR,MarginV,Encoding';
  var items = [].concat(styles.style).map(function(style) {
    return _values(style.$, 'Style: {name},{font_name},{font_size}, ' +
    '{primary_colour},{secondary_colour},{outline_colour}, ' +
    '{back_colour},{bold},{italic},{underline},{strikeout},{scale_x}, ' +
    '{scale_y},{spacing},{angle},{border_style},{outline},{shadow},' +
    '{alignment},{margin_l},{margin_r},{margin_v},{encoding}');
  });
  return '[V4+ Styles]\n' +
    'Format: ' + format + '\n' +
    items.join('\n') + '\n';
}

/**
 * Fills a predetermined format with the values from the attributes.
 * @param {Object.<string, *>} attributes
 * @param {string} value
 * @returns {string}
 */
function _values(attributes, format) {
  return format.replace(/{([^}]+)}/g, function(match, key) {
    return attributes[key] || '';
  });
}
