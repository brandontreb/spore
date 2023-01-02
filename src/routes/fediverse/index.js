const express = require('express');
const logger = require('../../config/logger');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();

const parseQuery = (query) => {  
  let queryString = '';
  for (let key in query) {
    queryString += `${key}=${query[key]}&`;
  }
  queryString = queryString.slice(0, -1);
  return queryString;
};

router.get('/host-meta', auth(false), (req, res) => {
  // redirect to https://fed.brid.gy/.well-known/host-meta with query params
  let queryString = parseQuery(req.query);
  logger.debug(`Redirecting to https://fed.brid.gy/.well-known/host-meta?${queryString}`);
  res.redirect(`https://fed.brid.gy/.well-known/host-meta?${queryString}`);
});

router.get('/webfinger', auth(false), (req, res) => {
  // redirect to https://fed.brid.gy/.well-known/webfinger with query params
  let queryString = parseQuery(req.query);
  logger.debug(`Redirecting to https://fed.brid.gy/.well-known/webfinger?${queryString}`);
  res.redirect(`https://fed.brid.gy/.well-known/webfinger?${queryString}`);
});

module.exports = router;