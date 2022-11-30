const config = require('../config/config');
const httpStatus = require('http-status');
const logger = require('../config/logger');
const { blogService } = require('../services');

const auth = (required) => async(req, res, next) => {
  // If the blog doesn't exist, Spore must be installed
  let blog = await blogService.getBlog();
  if (!blog) {
    if (req.originalUrl !== '/admin/install') {
      return res.redirect('/admin/install');
    }
    return next();
  }

  if (required && !config.dev) {
    // Check if the user is logged in
    let session = req.session;
    if (!session.isLoggedIn) {
      // If the user is not logged in, redirect to the login page
      let currentPath = req.originalUrl;
      currentPath = encodeURIComponent(currentPath);
      return res.redirect(`/admin/auth/login?redirect=${currentPath}`);
    }
  }

  // Hydrate the locals with the blog/user data
  res.locals = {
    ...res.locals,
    blog,
  }
  next();
};

module.exports = auth;