const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { blogService } = require('../services');
const flash = require('flash');

const getAdmin = catchAsync(async(req, res) => {
  res.render('admin/pages/index', {
    admin_title: 'Admin',
  });
});

const updateBlog = catchAsync(async(req, res) => {
  await blogService.updateBlog(req.body);
  req.flash('success', 'Blog updated successfully');
  res.redirect('/admin');
});

const install = catchAsync(async(req, res) => {
  let blog = res.locals.blog;
  let blogMeta = req.body;
  if (blog) {
    return res.redirect('/admin');
  }

  if (Object.keys(blogMeta).length === 0) {
    return res.render('admin/pages/install', {
      admin_title: 'Install',
      url: req.protocol + '://' + req.get('host')
    });
  }

  // Ensure that password matches password_again
  if (blogMeta.password !== blogMeta.password_again) {
    req.flash('error', 'Passwords do not match');
    return res.render('admin/pages/install', {
      admin_title: 'Install',
      title: blogMeta.title,
      url: blogMeta.url,
      username: blogMeta.username,
      email: blogMeta.email,
    });
  }

  delete blogMeta.password_again;

  // await blogService.saveBlogMeta(blogMeta);
  await blogService.createBlog(blogMeta);
  req.flash('success', 'Blog installed successfully. Please log in.');
  return res.redirect('/admin');

});

module.exports = {
  getAdmin,
  install,
  updateBlog
};