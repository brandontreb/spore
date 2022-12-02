const catchAsync = require('../utils/catchAsync');

const index = catchAsync(async(req, res) => {
  res.render('pages/index');
});

const post = catchAsync(async(req, res) => {
  res.render('pages/post');
});

module.exports = {
  index,
  post
}