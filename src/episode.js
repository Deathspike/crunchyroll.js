'use strict';
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var path = require('path');
var subtitle = require('./subtitle');
var video = require('./video');
var xml2js = require('xml2js');

/**
 * Streams the episode video and subtitle to disk.
 * @param {Object} config
 * @param {string} address
 * @param {function(Error)} done
 */
module.exports = function (config, address, done) {
  _page(address, function(err, page) {
    if (err) return done(err);
    _player(address, page.id, function(err, player) {
      if (err) return done(err);
      _download(config, page, player, done);
    });
  });
};

/**
 * Downloads the subtitle and video.
 * @private
 * @param {Object} config
 * @param {Object} page
 * @param {Object} player
 * @param {function(Error)} done
 */
function _download(config, page, player, done) {
  var tag = config.tag || 'CrunchyRoll';
  var episode = (page.episode < 10 ? '0' : '') + page.episode;
  var fileName = page.series + ' - ' + episode + ' [' + tag + ']';
  var filePath = path.join(config.path || process.cwd(), fileName);
  _subtitle(config, player, filePath, function(err) {
    if (err) return done(err);
    _video(config, page, player, filePath, done);
  });
}

/**
 * Requests the page data and scrapes the id, episode, series and swf.
 * @private
 * @param {string} address
 * @param {function(Error, Object=)} done
 */
function _page(address, done) {
  var id = parseInt((address.match(/[0-9]+$/) || [0])[0], 10);
  if (!id) return done(new Error('Invalid address.'));
  request.get(address, function(err, res, body) {
    if (err) return done(err);
    var $ = cheerio.load(body);
    var swf = /^([^?]+)/.exec($('link[rel=video_src]').attr('href'));
    var title = /Watch ([\w\W]+) Episode ([0-9]+)/.exec($('title').text());
    if (!swf || !title) return done(new Error('Invalid page.'));
    done(undefined, {
      id: id,
      episode: parseInt(title[2], 10),
      series: title[1],
      swf: swf[1]
    });
  });
}

/**
 * Requests the player data and scrapes the subtitle and video data.
 * @private
 * @param {string} address
 * @param {number} id
 * @param {function(Error, Object=)} done
 */
function _player(address, id, done) {
  var url = address.match(/^(https?:\/\/[^\/]+)/);
  if (!url) return done(new Error('Invalid address.'));
  request.post({
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
  var contents = player.subtitle;
  subtitle.decode(contents.id, contents.iv, contents.data, function(err, data) {
    if (err) return done(err);
    var format = subtitle.formats[config.format] ? config.format : 'srt';
    subtitle.formats[format](data, function(err, decodedSubtitle) {
      if (err) return done(err);
      fs.writeFile(filePath + '.' + format, decodedSubtitle, done);
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
