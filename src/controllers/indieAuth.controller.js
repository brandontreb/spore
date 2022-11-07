const uniquid = require('uniqid');
const utils = require('../utils/utils');
const config = require('../config/config');
const { tokenService, oauth2Service } = require('../services');
const SporeStore = require('../store');
const logger = require('../config/logger');

const authorize = async(req, res) => {
  let blog = config.blog;
  let { client_id, me, redirect_uri, response_type, scope, state } = req.query;

  if (!me) {
    return res.redirect(`${redirect_uri}?error=parameter_absent&error_description=me+parameter+absent&state=${state}`);
  }

  me = utils.normalizeUrl(me);

  if (me !== blog.url) {
    return res.redirect(`${redirect_uri}?error=invalid_request&error_description=me+parameter+does+not+match+the+blog+url&state=${state}`);
  }

  if (!client_id) {
    client_id = req.get('Referrer')
  }

  req.session.indieAuth = {...req.query };

  if (!scope) {
    req.session.indieAuth.scope = 'profile';
  }

  let insecure = req.query.code_challenge === null;
  res.render('pages/indieAuth/authorize', {...req.session.indieAuth, blog, redirect_uri, insecure });
}

const approve = async(req, res) => {
  let blog = config.blog;

  if (!req.session.indieAuth) {
    return res.redirect('/');
  }

  const { redirect_uri, state } = req.session.indieAuth;
  const code = uniquid('sp');

  let indieAuthRequestBody = {
    userId: blog.user.id,
    clientId: req.session.indieAuth.client_id,
    redirectUri: redirect_uri,
    scope: req.session.indieAuth.scope,
    code: code,
    state: state,
    responseType: req.session.indieAuth.response_type,
    codeChallenge: req.session.indieAuth.code_challenge,
    codeChallengeMethod: req.session.indieAuth.code_challenge_method,
  }

  await SporeStore.saveOAuth2Request(indieAuthRequestBody);

  res.redirect(`${redirect_uri}?code=${code}&state=${state}&me=${encodeURIComponent(blog.url)}`);
}

const token = async(req, res) => {

  let blog = config.blog;

  // Check for custom actions
  if (req.body.action && req.body.action === 'revoke') {
    // let { token } = req.body;
    // await tokenService.revokeToken(token);
    return res.json({});
  }

  const { grant_type, code, redirect_uri, code_verifier } = req.body;

  if (!code) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'code+parameter+absent'
    });
  }

  let indieAuthRequest = await SporeStore.getOAuth2RequestByCode(code);
  logger.debug('indieAuthRequest: %j', indieAuthRequest);

  if (!indieAuthRequest) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'invalid+code'
    });
  }

  if (indieAuthRequest.codeChallenge && !code_verifier) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'code_verifier+parameter+absent'
    });
  }

  // PKCE Check
  if (indieAuthRequest.codeChallenge) {
    if (grant_type === 'authorization_code' || grant_type == undefined) {
      let pkceVerifyChallengePassed = await oauth2Service.verifyPKCECodeChallengeFromVerifier(code_verifier,
        indieAuthRequest.codeChallenge, indieAuthRequest.codeChallengeMethod);
      if (!pkceVerifyChallengePassed) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'invalid+code+verifier'
        });
      }
    } else {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'invalid+grant_type'
      });
    }
  }

  // Make sure redirect_uri is the same as the one in the request
  if (redirect_uri !== indieAuthRequest.redirectUri) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'invalid+redirect_uri'
    });
  }

  let scope = indieAuthRequest.scope;
  let clientId = indieAuthRequest.clientId;
  let indieAuthRequestId = indieAuthRequest.id;

  let tokens = await tokenService.generateIndieAuthTokens(blog, scope, clientId, indieAuthRequestId);

  res.json({
    "me": blog.url,
    "profile": {
      "name": blog.user.username,
      "url": blog.url,
      "photo": blog.user.profile_photo ? `${blog.url}/${blog.user.profile_photo}` : blog.user.profile_photo_gravatar
    },
    ...tokens,
  });
}

/*
const verifyToken = async (req, res) => {
  let token = req.headers.authorization;

  if(!token) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'token+parameter+absent'
    });
  }

  token = token.split(' ')[1];

  try {
    let {tokenInfo, payload} = await tokenService.verifyToken(token);
    if(!tokenInfo) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'invalid+token'
      });
    }

    res.json({        
      ...payload,
    }); 
  } catch (error) {
    res.status(400).json({
      error: 'invalid_request',
      error_description: 'invalid+token'
    });
  }
};*/

module.exports = {
  authorize,
  approve,
  token
}