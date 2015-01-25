'use strict';
var isAuthenticated = false;
var request = require('request');

/**
 * Performs a GET request for the resource.
 * @param {Object} config
 * @param {(string|Object)} options
 * @param {function(Error, Object, string)} done
 */
module.exports.get = function(config, options, done) {
  _authenticate(config, function(err) {
    if (err) return done(err);
    request.get(_modify(options), done);
  });
};

/**
* Performs a POST request for the resource.
* @private
* @param {Object} config
* @param {(string|Object)} options
* @param {function(Error, Object, string)} done
*/
module.exports.post = function(config, options, done) {
  _authenticate(config, function(err) {
    if (err) return done(err);
    request.post(_modify(options), done);
  });
};

/**
 * Authenticates using the configured pass and user.
 * @private
 * @param {Object} config
 * @param {function(Error)} done
 */
function _authenticate(config, done) {
  if (isAuthenticated || !config.pass || !config.user) return done();
  request.post({
    form: {
      formname: 'RpcApiUser_Login',
      fail_url: 'https://www.crunchyroll.com/login',
      name: config.user,
      password: config.pass
    },
    jar: true,
    url: 'https://www.crunchyroll.com/?a=formhandler'
  }, function(err) {
    if (err) return done(err);
    isAuthenticated = true;
    done();
  });
}

/**
 * Modifies the options to use the authenticated cookie jar.
 * @private
 * @param {(string|Object)} options
 * @returns {Object}
 */
function _modify(options) {
  if (typeof options === 'string') options = {url: options};
  options.jar = true;
  return options;
}
