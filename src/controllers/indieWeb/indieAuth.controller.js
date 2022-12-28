const uniquid = require('uniqid');
const utils = require('../../utils/utils');
const { tokenService, oauth2Service } = require('../../services');
const SporeStore = require('../../store');
const logger = require('../../config/logger');

const authorize = async(req, res) => {
  let blog = res.locals.blog;

  let { client_id, me, redirect_uri, scope, state } = req.query;

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
  res.render('indieWeb/indieAuth/authorize', {...req.session.indieAuth, blog, redirect_uri, insecure });
}

const approve = async(req, res) => {
  let blog = res.locals.blog;

  if (!req.session.indieAuth) {
    return res.redirect('/');
  }

  const { redirect_uri, state } = req.session.indieAuth;
  const code = uniquid('sp');

  let indieAuthRequestBody = {
    blog_id: blog.id,
    user_id: blog.user.id,
    client_id: req.session.indieAuth.client_id,
    redirect_uri: redirect_uri,
    scope: req.session.indieAuth.scope,
    code: code,
    state: state,
    response_type: req.session.indieAuth.response_type,
    code_challenge: req.session.indieAuth.code_challenge,
    code_challenge_method: req.session.indieAuth.code_challenge_method,
  }

  await SporeStore.saveOAuthRequest(indieAuthRequestBody);
  let redirectUri = `${redirect_uri}?code=${code}&state=${state}&me=${encodeURIComponent(blog.url)}`;
  logger.debug('redirectUri: %s', redirectUri);
  res.redirect(redirectUri);
}

const token = async(req, res) => {

  let blog = res.locals.blog;

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

  let indieAuthRequest = await SporeStore.getOAuthRequestByCode(code);
  logger.debug('indieAuthRequest: %j', indieAuthRequest);

  if (!indieAuthRequest) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'invalid+code'
    });
  }

  if (indieAuthRequest.code_challenge && !code_verifier) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'code_verifier+parameter+absent'
    });
  }

  // PKCE Check
  if (indieAuthRequest.code_challenge) {
    if (grant_type === 'authorization_code' || grant_type == undefined) {
      let pkceVerifyChallengePassed = await oauth2Service.verifyPKCECodeChallengeFromVerifier(code_verifier,
        indieAuthRequest.code_challenge, indieAuthRequest.code_challenge_method);
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
  if (redirect_uri !== indieAuthRequest.redirect_uri) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'invalid+redirect_uri'
    });
  }

  let scope = indieAuthRequest.scope;
  let clientId = indieAuthRequest.client_id;
  let indieAuthRequestId = indieAuthRequest.id;

  let tokens = await tokenService.generateIndieAuthTokens(blog, scope, clientId, indieAuthRequestId);

  res.json({
    "me": blog.url,
    "profile": {
      "name": blog.user.username,
      "url": blog.url,
      "photo": blog.user.avatar ? `${blog.url}/${blog.user.avatar}` : blog.user.gravatar,
    },
    ...tokens,
  });
}


const verifyToken = async(req, res) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'token+parameter+absent'
    });
  }

  token = token.split(' ')[1];

  try {
    const tokenDoc = await tokenService.verifyToken(token);
    if (!tokenDoc) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'invalid+token'
      });
    }

    res.json({
      ...tokenDoc,
    });
  } catch (error) {
    res.status(400).json({
      error: 'invalid_request',
      error_description: 'invalid+token'
    });
  }
};

module.exports = {
  authorize,
  approve,
  token,
  verifyToken
}