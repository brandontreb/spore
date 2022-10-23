const crypto = require("crypto");

const pkceChallengeFromVerifier = function(v) {
  let hashed = crypto.createHash("sha256").update(v).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return hashed;
}

const verifyPKCECodeChallengeFromVerifier = async(code_verifier, code_challenge, code_challenge_method = 'S256') => {
  if (code_challenge_method === 'plain') {
    return code_verifier === code_challenge;
  }

  if (code_challenge_method === 'S256') {
    return pkceChallengeFromVerifier(code_verifier) === code_challenge;
  }
  return false;
};

module.exports = {
  pkceChallengeFromVerifier,
  verifyPKCECodeChallengeFromVerifier
};