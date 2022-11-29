const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const getAccount = catchAsync(async(req, res) => {
  res.render('admin/pages/account', {
    admin_title: 'Account',
  });
});

const updateAccount = catchAsync(async(req, res) => {
  let body = req.body;
  let user = res.locals.blog.user;

  if (body.password && body.password !== body.password_again) {
    req.flash('error', 'Passwords do not match');
    res.redirect('/admin/account');
    return;
  }

  if (!body.password) {
    delete body.password;
    delete body.password_again;
  }

  await userService.updateUser(user.id, body);
  req.flash('success', 'Account updated successfully');
  res.redirect('/admin/account');
});

const getPhoto = catchAsync(async(req, res) => {
  res.render('admin/pages/photo', {
    admin_title: 'Profile Photo',
  });
});

const updatePhoto = catchAsync(async(req, res) => {
  let user = res.locals.blog.user;
  await userService.updateUser(user.id, {
    profile_photo: req.file.path
  });
  req.flash('success', 'Profile photo updated successfully');
  res.redirect('/admin/account');
});

const deletePhoto = catchAsync(async(req, res) => {
  let user = res.locals.blog.user;
  await userService.updateUser(user.id, {
    profile_photo: ''
  });
  req.flash('success', 'Profile photo updated successfully');
  res.redirect('/admin/account/photo');
});

module.exports = {
  getAccount,
  updateAccount,
  getPhoto,
  updatePhoto,
  deletePhoto,
};