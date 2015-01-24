'use strict';
var cheerio = require('cheerio');
var episode = require('./episode');
var persistent = '.crpersistent';
var fs = require('fs');
var request = require('request');
var path = require('path');
var url = require('url');

/**
 * Streams the series to disk.
 * @param {Object} config
 * @param {string} address
 * @param {function(Error)} done
 */
module.exports = function (config, address, done) {
  var persistentPath = path.join(config.output || process.cwd(), persistent);
  fs.readFile(persistentPath, 'utf8', function(err, data) {
    var cache = config.cache ? {} : JSON.parse(data || '{}');
    _page(address, function(err, page) {
      if (err) return done(err);
      var i = 0;
      (function next() {
        if (i >= page.episodes.length) return done();
        var episode = page.episodes[i];
        var episodeAddress = url.resolve(address, episode.address);
        _download(cache, config, episodeAddress, function(err) {
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
 * @param {Object.<string, string>} cache
 * @param {Object} config
 * @param {string} address
 * @param {function(Error)} done
 */
function _download(cache, config, address, done) {
  if (cache[address]) return done();
  episode(config, address, function(err) {
    if (err) return done(err);
    cache[address] = Date.now();
    done();
  });
}

/**
 * Requests the page data and scrapes the episodes and series.
 * @private
 * @param {string} address
 * @param {function(Error, Object=)} done
 */
function _page(address, done) {
  request.get(address, function(err, res, body) {
    if (err) return done(err);
    var $ = cheerio.load(body);
    var title = $('.season-dropdown').text() || $('span[itemprop=name]').text();
    if (!title) return done(new Error('Invalid page.'));
    var episodes = [];
    $('.episode').each(function(i, el) {
      if ($(el).children('img[src*=coming_soon]').length) return;
      var address = $(el).attr('href');
      var title = ($(el).children('.series-title').text() || '').trim();
      var match = /([0-9]+)$/.exec(title);
      if (!address || !match) return;
      episodes.push({address: address, episode: parseInt(match[0], 10)});
    });
    done(undefined, {episodes: episodes.reverse(), series: title});
  });
}
