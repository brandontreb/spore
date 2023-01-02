const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { blogService, postService } = require('../services');

const getAdmin = catchAsync(async(req, res) => {
  res.render('admin/pages/index', {
    admin_title: 'Admin',
  });
});

const updateBlog = catchAsync(async(req, res) => {
  let blog = res.locals.blog;
  await blogService.updateBlog(blog, req.body);
  req.flash('success', 'Blog updated successfully');
  res.redirect('/admin');
});

const install = catchAsync(async(req, res) => {
  let blog = res.locals.blog;
  let blogMeta = req.body;

  // Redirect if the blog is already installed
  if (blog) {
    return res.redirect('/admin');
  }

  // If this is a GET request, render the install page  
  if (req.method === 'GET' || Object.keys(blogMeta).length === 0) {
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

  // Create the blog and redirect to the admin page
  await blogService.createBlog(blogMeta);
  req.flash('success', 'Blog installed successfully. Please log in.');
  return res.redirect('/admin');

});

const getPosts = catchAsync(async(req, res) => {
  let blog = res.locals.blog;
  let type = req.query.type || 'note';
  let posts = await postService.queryPosts({
    blog_id: blog.id,
    type: type
  }, {
    order: [
      ['published_date', 'DESC']
    ],
    limit: res.locals.postsPerPage,
    offset: (res.locals.page - 1) * res.locals.postsPerPage
  });
  res.render('admin/pages/posts', {
    admin_title: 'Posts',
    posts: posts,
    type: type,
    page: res.locals.page,
    postsPerPage: res.locals.postsPerPage,
  });
});

const getPost = catchAsync(async(req, res) => {
  let blog = res.locals.blog;
  let post = await postService.getPostById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  res.render('admin/pages/post', {
    admin_title: 'Post',
    post: post,
    type: post.type,
  });
});

const updatePost = catchAsync(async(req, res) => {  
  let blog = res.locals.blog;
  let type = req.body.title && req.body.title.length > 0 ? 'article' : 'note';
  let post = await postService.getPostById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  let postDoc = {
    ...req.body,
    type: type,
    blog_id: blog.id,
    id: post.id
  }

  logger.debug("Updating post: " + JSON.stringify(postDoc));
  await postService.createPost(postDoc);
  req.flash('success', 'Post updated successfully');
  res.redirect('/admin/posts/' + post.id);
});

const deletePost = catchAsync(async(req, res) => {
  let blog = res.locals.blog;
  let post = await postService.getPostById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  await postService.deletePost(post.id);
  req.flash('success', 'Post deleted successfully');
  res.redirect('/admin/posts');
});

module.exports = {
  getAdmin,
  install,
  updateBlog,
  getPosts,
  getPost,
  updatePost,
  deletePost
};