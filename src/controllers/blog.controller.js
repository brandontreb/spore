const catchAsync = require('../utils/catchAsync');
const { postService } = require('../services');
const logger = require('../config/logger');

const index = catchAsync(async(req, res) => {
  let page = res.locals.page;

  let posts = await postService.queryPosts({
    blog_id: res.locals.blog.id,
    status: 'published',
  }, {
    order: [
      ['published_date', 'DESC']
    ],
    limit: 25,
    offset: (page - 1) * 25
  });
  res.render('pages/index', {
    title: res.locals.blog.title,
    posts: posts,
    ...res.locals
  });
});

const getPost = catchAsync(async(req, res) => {
  let blog = res.locals.blog;
  let slug = req.params.slug;
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

  res.render('pages/single', locals);
});

module.exports = {
  index,
  getPost
}