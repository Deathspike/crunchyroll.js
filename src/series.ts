'use strict';
export = main;
import cheerio = require('cheerio');
import episode = require('./episode');
import fs = require('fs');
import request = require('./request');
import path = require('path');
import typings = require('./typings');
import url = require('url');
var persistent = '.crpersistent';

/**
 * Streams the series to disk.
 */
function main(config: typings.IConfig, address: string, done: (err: Error) => void) {
  var persistentPath = path.join(config.output || process.cwd(), persistent);
  fs.readFile(persistentPath, 'utf8', (err, contents) => {
    var cache = config.cache ? {} : JSON.parse(contents || '{}');
    page(config, address, (err, page) => {
      if (err) return done(err);
      var i = 0;
      (function next() {
        if (i >= page.episodes.length) return done(null);
        download(cache, config, address, page.episodes[i], err => {
          if (err) return done(err);
          var newCache = JSON.stringify(cache, null, '  ');
          fs.writeFile(persistentPath, newCache, err => {
            if (err) return done(err);
            i += 1;
            next();
          });
        });
      })();
    });
  });
}

/**
 * Downloads the episode.
 */
function download(cache: {[address: string]: number}, config: typings.IConfig, baseAddress: string, item: typings.ISeriesEpisode, done: (err: Error) => void) {
  if (!filter(config, item)) return done(null);
  var address = url.resolve(baseAddress, item.address);
  if (cache[address]) return done(null);
  episode(config, address, err => {
    if (err) return done(err);
    cache[address] = Date.now();
    done(null);
  });
}

/**
 * Filters the item based on the configuration.
 */
function filter(config: typings.IConfig, item: typings.ISeriesEpisode) {
  // Filter on chapter.
  var episodeFilter = config.episode;
  if (episodeFilter > 0 && item.episode <= episodeFilter) return false;
  if (episodeFilter < 0 && item.episode >= -episodeFilter) return false;

  // Filter on volume.
  var volumeFilter = config.volume;
  if (volumeFilter > 0 && item.volume <= volumeFilter) return false;
  if (volumeFilter < 0 && item.volume >= -volumeFilter) return false;
  return true;
}

/**
 * Requests the page and scrapes the episodes and series.
 */
function page(config: typings.IConfig, address: string, done: (err: Error, result?: typings.ISeries) => void) {
  request.get(config, address, (err, result) => {
    if (err) return done(err);
    var $ = cheerio.load(result);
    var title = $('span[itemprop=name]').text();
    if (!title) return done(new Error('Invalid page.'));
    var episodes: typings.ISeriesEpisode[] = [];
    $('.episode').each((i, el) => {
      if ($(el).children('img[src*=coming_soon]').length) return;
      var volume = /([0-9]+)\s*$/.exec($(el).closest('ul').prev('a').text());
      var regexp = /Episode\s+([0-9]+)\s*$/i;
      var episode = regexp.exec($(el).children('.series-title').text());
      var address = $(el).attr('href');
      if (!address || !episode) return;
      episodes.push({
        address: address,
        episode: parseInt(episode[0], 10),
        volume: volume ? parseInt(volume[0], 10) : 1
      });
    });
    done(null, {episodes: episodes.reverse(), series: title});
  });
}