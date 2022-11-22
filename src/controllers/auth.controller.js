const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const { blogService } = require('../services');

const getLogin = catchAsync(async(req, res) => {

  if (req.query.redirect) {
    req.session.redirect = req.query.redirect;
  }

  res.render('admin/pages/login', {
    admin_title: 'Login',
  });
});

const loginWithEmailAndPassword = catchAsync(async(req, res, next) => {
  const { email, password } = req.body;
  const authenticated = await blogService.loginWithEmailAndPassword(email, password);

  if (authenticated || config.dev) {
    req.session.isLoggedIn = true;
    req.session.save(err => {
      if (err) {
        console.error(err);
        return next(err);
      }
      if (req.session.redirect) {
        let redirect = req.session.redirect;
        redirect = decodeURIComponent(redirect);
        delete req.session.redirect;
        return res.redirect(redirect);
      }

      return res.redirect('/admin');
    });
  } else {
    res.flash('error', 'Invalid email or password');
    return res.redirect('/admin/auth/login');
  }
});

const logout = catchAsync(async(req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return next(err);
    }
    return res.redirect('/');
  });
});

module.exports = {
  getLogin,
  loginWithEmailAndPassword,
  logout,
}