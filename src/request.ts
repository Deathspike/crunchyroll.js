'use strict';
import request = require('request');
import typings = require('./typings');
var isAuthenticated = false;

/**
 * Performs a GET request for the resource.
 */
export function get(config: typings.IConfig, options: request.Options, done: (err: Error, result?: string) => void) {
  authenticate(config, err => {
    if (err) return done(err);
    request.get(modify(options), (err: Error, response: any, body: any) => {
      if (err) return done(err);
      done(null, typeof body === 'string' ? body : String(body));
    });
  });
}

/**
* Performs a POST request for the resource.
*/
export function post(config: typings.IConfig, options: request.Options, done: (err: Error, result?: string) => void) {
  authenticate(config, err => {
    if (err) return done(err);
    request.post(modify(options), (err: Error, response: any, body: any) => {
      if (err) return done(err);
      done(null, typeof body === 'string' ? body : String(body));
    });
  });
}

/**
 * Authenticates using the configured pass and user.
 */
function authenticate(config: typings.IConfig, done: (err: Error) => void) {
  if (isAuthenticated || !config.pass || !config.user) return done(null);
  var options = {
    form: {
      formname: 'RpcApiUser_Login',
      fail_url: 'https://www.crunchyroll.com/login',
      name: config.user,
      password: config.pass
    },
    jar: true,
    url: 'https://www.crunchyroll.com/?a=formhandler'
  };
  request.post(options, (err: Error) => {
    if (err) return done(err);
    isAuthenticated = true;
    done(null);
  });
}

/**
 * Modifies the options to use the authenticated cookie jar.
 */
function modify(options: string|request.Options): request.Options {
  if (typeof options !== 'string') {
    options.jar = true;
    return options;
  }
  return {jar: true, url: options.toString()};
}