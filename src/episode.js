'use strict';
var cheerio = require('cheerio');
var fs = require('fs');
var mkdirp = require('mkdirp');
var request = require('./request');
var path = require('path');
var subtitle = require('./subtitle');
var video = require('./video');
var xml2js = require('xml2js');

/**
 * Streams the episode to disk.
 * @param {Object} config
 * @param {string} address
 * @param {function(Error)} done
 */
module.exports = function (config, address, done) {
  _page(config, address, function(err, page) {
    if (err) return done(err);
    _player(config, address, page.id, function(err, player) {
      if (err) return done(err);
      _download(config, page, player, done);
    });
  });
};

/**
 * Completes a download and writes the message with an elapsed time.
 * @private
 * @param {string} message
 * @param {number} begin
 * @param {function(Error)} done
 */
function _complete(message, begin, done) {
  var timeInMs = Date.now() - begin;
  var seconds = _prefix(Math.floor(timeInMs / 1000) % 60, 2);
  var minutes = _prefix(Math.floor(timeInMs / 1000 / 60) % 60, 2);
  var hours = _prefix(Math.floor(timeInMs / 1000 / 60 / 60), 2);
  console.log(message + ' (' + hours + ':' + minutes + ':' + seconds + ')');
  done();
}

/**
 * Downloads the subtitle and video.
 * @private
 * @param {Object} config
 * @param {Object} page
 * @param {Object} player
 * @param {function(Error)} done
 */
function _download(config, page, player, done) {
  var series = config.series || page.series;
  var fileName = _name(config, page, series);
  var filePath = path.join(config.output || process.cwd(), series, fileName);
  mkdirp(path.dirname(filePath), function(err) {
    if (err) return done(err);
    _subtitle(config, player, filePath, function(err) {
      if (err) return done(err);
      var now = Date.now();
      console.log('Fetching ' + fileName);
      _video(config, page, player, filePath, function(err) {
        if (err) return done(err);
        if (config.merge) return _complete('Finished ' + fileName, now, done);
        video.merge(config, player.video.file, filePath, function(err) {
          if (err) return done(err);
          _complete('Finished ' + fileName, now, done);
        });
      });
    });
  });
}

/**
 * Names the file based on the config, page, series and tag.
 * @private
 * @param {Object} config
 * @param {Object} page
 * @param {string} series
 * @returns {string}
 */
function _name(config, page, series) {
  var episode = (page.episode < 10 ? '0' : '') + page.episode;
  var volume = (page.volume < 10 ? '0' : '') + page.volume;
  var tag = config.tag || 'CrunchyRoll';
  return series + ' ' + volume + 'x' + episode + ' [' + tag + ']';
}

/**
 * Requests the page data and scrapes the id, episode, series and swf.
 * @private
 * @param {Object} config
 * @param {string} address
 * @param {function(Error, Object=)} done
 */
function _page(config, address, done) {
  var id = parseInt((address.match(/[0-9]+$/) || [0])[0], 10);
  if (!id) return done(new Error('Invalid address.'));
  request.get(config, address, function(err, res, body) {
    if (err) return done(err);
    var $ = cheerio.load(body);
    var swf = /^([^?]+)/.exec($('link[rel=video_src]').attr('href'));
    var regexp = /Watch\s+(.+?)(?:\s+Season\s+([0-9]+))?\s+Episode\s+([0-9]+)/;
    var data = regexp.exec($('title').text());
    if (!swf || !data) return done(new Error('Invalid page.'));
    done(undefined, {
      id: id,
      episode: parseInt(data[3], 10),
      series: data[1],
      swf: swf[1],
      volume: parseInt(data[2], 10) || 1
    });
  });
}

/**
 * Prefixes a value.
 * @private
 * @param {(number|string)} value
 * @param {number} length
 * @returns {string}
 */
function _prefix(value, length) {
  if (typeof value !== 'string') value = String(value);
  while (value.length < length) value = '0' + value;
  return value;
}

/**
 * Requests the player data and scrapes the subtitle and video data.
 * @private
 * @param {Object} config
 * @param {string} address
 * @param {number} id
 * @param {function(Error, Object=)} done
 */
function _player(config, address, id, done) {
  var url = address.match(/^(https?:\/\/[^\/]+)/);
  if (!url) return done(new Error('Invalid address.'));
  request.post(config, {
    form: {current_page: address},
    url: url[1] + '/xml/?req=RpcApiVideoPlayer_GetStandardConfig&media_id=' + id
  }, function(err, res, xml) {
    if (err) return done(err);
    xml2js.parseString(xml, {
      explicitArray: false,
      explicitRoot: false
    }, function(err, player) {
      if (err) return done(err);
      try {
        done(undefined, {
          subtitle: {
            id: player['default:preload'].subtitle.$.id,
            iv: player['default:preload'].subtitle.iv,
            data: player['default:preload'].subtitle.data
          },
          video: {
            file: player['default:preload'].stream_info.file,
            host: player['default:preload'].stream_info.host
          }
        });
      } catch(err) {
        done(err);
      }
    });
  });
}

/**
 * Saves the subtitles to disk.
 * @private
 * @param {Object} config
 * @param {Object} player
 * @param {string} filePath
 * @param {function(Error)} done
 */
function _subtitle(config, player, filePath, done) {
  var enc = player.subtitle;
  subtitle.decode(enc.id, enc.iv, enc.data, function(err, data) {
    if (err) return done(err);
    var format = subtitle.formats[config.format] ? config.format : 'ass';
    subtitle.formats[format](data, function(err, decodedSubtitle) {
      if (err) return done(err);
      fs.writeFile(filePath + '.' + format, '\ufeff' + decodedSubtitle, done);
    });
  });
}

/**
 * Streams the video to disk.
 * @private
 * @param {Object} config
 * @param {Object} page
 * @param {Object} player
 * @param {string} filePath
 * @param {function(Error)} done
 */
function _video(config, page, player, filePath, done) {
  video.stream(
    player.video.host,
    player.video.file,
    page.swf,
    filePath + path.extname(player.video.file),
    done);
}
