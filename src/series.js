'use strict';
var cheerio = require('cheerio');
var episode = require('./episode');
var persistent = '.crpersistent';
var fs = require('fs');
var request = require('./request');
var path = require('path');
var url = require('url');

/**
 * Streams the series to disk.
 * @param {Object} config
 * @param {string} address
 * @param {function(Error)} done
 */
module.exports = function(config, address, done) {
  var persistentPath = path.join(config.output || process.cwd(), persistent);
  fs.readFile(persistentPath, 'utf8', function(err, contents) {
    var cache = config.cache ? {} : JSON.parse(contents || '{}');
    _page(config, address, function(err, page) {
      if (err) return done(err);
      var i = 0;
      (function next() {
        if (i >= page.episodes.length) return done();
        _download(cache, config, address, page.episodes[i], function(err) {
          if (err) return done(err);
          var newCache = JSON.stringify(cache, null, '  ');
          fs.writeFile(persistentPath, newCache, function(err) {
            if (err) return done(err);
            i += 1;
            next();
          });
        });
      })();
    });
  });
};

/**
 * Downloads the episode.
 * @private
 * @param {Object.<string, string>} cache
 * @param {Object} config
 * @param {string} baseAddress
 * @param {Object} item
 * @param {function(Error)} done
 */
function _download(cache, config, baseAddress, item, done) {
  if (!_filter(config, item)) return done();
  var address = url.resolve(baseAddress, item.address);
  if (cache[address]) return done();
  episode(config, address, function(err) {
    if (err) return done(err);
    cache[address] = Date.now();
    done();
  });
}

/**
* Filters the item based on the configuration.
* @param {Object} config
* @param {Object} item
* @returns {boolean}
*/
function _filter(config, item) {
  // Filter on chapter.
  var episodeFilter = parseInt(config.episode, 10);
  if (episodeFilter > 0 && item.episode <= episodeFilter) return false;
  if (episodeFilter < 0 && item.episode >= -episodeFilter) return false;

  // Filter on volume.
  var volumeFilter = parseInt(config.volume, 10);
  if (volumeFilter > 0 && item.volume <= volumeFilter) return false;
  if (volumeFilter < 0 && item.volume >= -volumeFilter) return false;
  return true;
}

/**
 * Requests the page and scrapes the episodes and series.
 * @private
 * @param {Object} config
 * @param {string} address
 * @param {function(Error, Object=)} done
 */
function _page(config, address, done) {
  request.get(config, address, function(err, res, body) {
    if (err) return done(err);
    var $ = cheerio.load(body);
    var title = $('span[itemprop=name]').text();
    if (!title) return done(new Error('Invalid page.'));
    var episodes = [];
    $('.episode').each(function(i, el) {
      if ($(el).children('img[src*=coming_soon]').length) return;
      var address = $(el).attr('href');
      var episode = /([0-9]+)\s*$/.exec($(el).children('.series-title').text());
      var volume = /([0-9]+)\s*$/.exec($(el).closest('ul').prev('a').text());
      if (!address || !episode) return;
      episodes.push({
        address: address,
        episode: parseInt(episode[0], 10),
        volume: volume ? parseInt(volume[0], 10) : 1
      });
    });
    done(undefined, {episodes: episodes.reverse(), series: title});
  });
}
