'use strict';
import cheerio = require('cheerio');
import fs = require('fs');
import mkdirp = require('mkdirp');
import request = require('./request');
import path = require('path');
import subtitle from './subtitle/index';
import video from './video/index';
import xml2js = require('xml2js');

/**
 * Streams the episode to disk.
 */
export default function(config: IConfig, address: string, done: (err: Error) => void) {
  scrapePage(config, address, (err, page) => {
    if (err) return done(err);
    scrapePlayer(config, address, page.id, (err, player) => {
      if (err) return done(err);
      download(config, page, player, done);
    });
  });
}

/**
 * Completes a download and writes the message with an elapsed time.
 */
function complete(message: string, begin: number, done: (err: Error) => void) {
  var timeInMs = Date.now() - begin;
  var seconds = prefix(Math.floor(timeInMs / 1000) % 60, 2);
  var minutes = prefix(Math.floor(timeInMs / 1000 / 60) % 60, 2);
  var hours = prefix(Math.floor(timeInMs / 1000 / 60 / 60), 2);
  console.log(message + ' (' + hours + ':' + minutes + ':' + seconds + ')');
  done(null);
}

/**
 * Downloads the subtitle and video.
 */
function download(config: IConfig, page: IEpisodePage, player: IEpisodePlayer, done: (err: Error) => void) {
  var series = config.series || page.series;
  var fileName = name(config, page, series);
  var filePath = path.join(config.output || process.cwd(), series, fileName);
  mkdirp(path.dirname(filePath), (err: Error) => {
    if (err) return done(err);
    downloadSubtitle(config, player, filePath, err => {
      if (err) return done(err);
      var now = Date.now();
      console.log('Fetching ' + fileName);
      downloadVideo(config, page, player, filePath, err => {
        if (err) return done(err);
        if (config.merge) return complete('Finished ' + fileName, now, done);
        var isSubtited = Boolean(player.subtitle);
        video.merge(config, isSubtited, player.video.file, filePath, err => {
          if (err) return done(err);
          complete('Finished ' + fileName, now, done);
        });
      });
    });
  });
}

/**
 * Saves the subtitles to disk.
 */
function downloadSubtitle(config: IConfig, player: IEpisodePlayer, filePath: string, done: (err?: Error) => void) {
  var enc = player.subtitle;
  if (!enc) return done();
  subtitle.decode(enc.id, enc.iv, enc.data, (err, data) => {
    if (err) return done(err);
    var formats = subtitle.formats;
    var format = formats[config.format] ? config.format : 'ass';
    formats[format](data, (err: Error, decodedSubtitle: string) => {
      if (err) return done(err);
      fs.writeFile(filePath + '.' + format, '\ufeff' + decodedSubtitle, done);
    });
  });
}

/**
 * Streams the video to disk.
 */
function downloadVideo(config: IConfig,
  page: IEpisodePage,
  player: IEpisodePlayer,
  filePath: string,
  done: (err: Error) => void) {
  video.stream(
    player.video.host,
    player.video.file,
    page.swf,
    filePath + path.extname(player.video.file),
    done);
}

/**
 * Names the file based on the config, page, series and tag.
 */
function name(config: IConfig, page: IEpisodePage, series: string) {
  var episode = (page.episode < 10 ? '0' : '') + page.episode;
  var volume = (page.volume < 10 ? '0' : '') + page.volume;
  var tag = config.tag || 'CrunchyRoll';
  return series + ' ' + volume + 'x' + episode + ' [' + tag + ']';
}

/**
 * Prefixes a value.
 */
function prefix(value: number|string, length: number) {
  var valueString = typeof value !== 'string' ? String(value) : value;
  while (valueString.length < length) valueString = '0' + valueString;
  return valueString;
}

/**
 * Requests the page data and scrapes the id, episode, series and swf.
 */
function scrapePage(config: IConfig, address: string, done: (err: Error, page?: IEpisodePage) => void) {
  var id = parseInt((address.match(/[0-9]+$/) || ['0'])[0], 10);
  if (!id) return done(new Error('Invalid address.'));
  request.get(config, address, (err, result) => {
    if (err) return done(err);
    var $ = cheerio.load(result);
    var swf = /^([^?]+)/.exec($('link[rel=video_src]').attr('href'));
    var regexp = /-\s+(?:Watch\s+)?(.+?)(?:\s+Season\s+([0-9]+))?(?:\s+-)?\s+Episode\s+([0-9]+)/;
    var data = regexp.exec($('title').text());
    if (!swf || !data) return done(new Error('Invalid page.'));
    done(null, {
      id: id,
      episode: parseInt(data[3], 10),
      series: data[1],
      swf: swf[1],
      volume: parseInt(data[2], 10) || 1
    });
  });
}

/**
 * Requests the player data and scrapes the subtitle and video data.
 */
function scrapePlayer(config: IConfig, address: string, id: number, done: (err: Error, player?: IEpisodePlayer) => void) {
  var url = address.match(/^(https?:\/\/[^\/]+)/);
  if (!url) return done(new Error('Invalid address.'));
  request.post(config, {
    form: {current_page: address},
    url: url[1] + '/xml/?req=RpcApiVideoPlayer_GetStandardConfig&media_id=' + id
  }, (err, result) => {
    if (err) return done(err);
    xml2js.parseString(result, {
      explicitArray: false,
      explicitRoot: false
    }, (err: Error, player: IEpisodePlayerConfig) => {
      if (err) return done(err);
      try {
        var isSubtitled = Boolean(player['default:preload'].subtitle);
        done(null, {
          subtitle: isSubtitled ? {
            id: parseInt(player['default:preload'].subtitle.$.id, 10),
            iv: player['default:preload'].subtitle.iv,
            data: player['default:preload'].subtitle.data
          } : null,
          video: {
            file: player['default:preload'].stream_info.file,
            host: player['default:preload'].stream_info.host
          }
        });
      } catch (parseError) {
        done(parseError);
      }
    });
  });
}
