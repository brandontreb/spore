const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens');

/**
 * Generate token
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (blogUrl, expires, type, otherItems, secret = config.jwt.secret) => {
  const payload = {
    sub: blogUrl,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
    ...otherItems
  };
  return jwt.sign(payload, secret);
};

// /**
//  * Verify token and return token doc (or throw an error if it is not valid)
//  * @param {string} token
//  * @param {string} type
//  * @returns {Promise<Token>}
//  */
const verifyToken = async(token, type = tokenTypes.ACCESS) => {
  const payload = jwt.verify(token, config.jwt.secret);
  return payload;
};

// /**
//  * Generate auth tokens
//  * @param {User} user
//  * @returns {Promise<Object>}
//  */
const generateIndieAuthTokens = async(
  blog,
  scope,
  client_id,
) => {

  scope = scope || 'profile';
  client_id = client_id || 'unknown';

  const accessTokenExpires = moment().add(100000, 'minutes');

  // Save access token
  let tokenBody = {
    me: blog.url,
    scope,
    client_id,
    blog_id: blog.id,
    expires_at: accessTokenExpires.toDate(),
    type: tokenTypes.ACCESS
  };
  const accessToken = generateToken(blog.url, accessTokenExpires, tokenTypes.ACCESS, tokenBody);

  tokenBody.token = accessToken;

  // Save refresh token
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(blog.url, refreshTokenExpires, tokenTypes.REFRESH);

  tokenBody.token = refreshToken;
  tokenBody.type = tokenTypes.REFRESH;
  tokenBody.expires_at = refreshTokenExpires.toDate();

  return {
    access_token: accessToken,
    "token_type": "Bearer",
    expires_in: config.jwt.accessExpirationMinutes * 60 * 1000,
    refresh_token: refreshToken,
    scope: scope
  };
};

module.exports = {
  generateToken,
  verifyToken,
  generateIndieAuthTokens,
};