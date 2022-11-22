const config = require('../config/config');
const httpStatus = require('http-status');
const logger = require('../config/logger');
const { blogService } = require('../services');

const isAdmin = (required) => async(req, res, next) => {
  let blog = await blogService.getBlog();

  if (!blog) {
    if (req.originalUrl !== '/admin/install') {
      return res.redirect('/admin/install');
    }
    return next();
  }

  // Check if logged in
  let session = req.session;
  logger.debug('Session: %o', session.isLoggedIn);

  if (required && !config.dev) {
    if (!session.isLoggedIn) {
      let currentPath = req.originalUrl;
      currentPath = encodeURIComponent(currentPath);
      return res.redirect(`/admin/auth/login?redirect=${currentPath}`);
    }
  }


  res.locals = {
    ...res.locals,
    blog,
  }
  next();
};

module.exports = isAdmin;