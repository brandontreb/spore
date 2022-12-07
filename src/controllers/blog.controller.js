const catchAsync = require('../utils/catchAsync');
const { postService } = require('../services');
const logger = require('../config/logger');

const index = catchAsync(async(req, res) => {
  res.render('pages/index');
});

const getPost = catchAsync(async(req, res) => {
  let slug = req.params.slug;
  logger.debug('Getting post with slug: %s', slug);
  let post = await postService.getPostBySlug(slug);

  // If the post is not published, redirect to the blog page
  if (!post) {
    return res.render('pages/404', {
      title: blog.title,
    });
  }

  let locals = {
    title: post.title,
    post: post,
    ...res.locals
  }

  res.render('pages/post', locals);
});

module.exports = {
  index,
  getPost
}