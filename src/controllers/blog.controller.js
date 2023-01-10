const catchAsync = require('../utils/catchAsync');
const { postService } = require('../services');
const { Op } = require('sequelize');
const logger = require('../config/logger');

const index = catchAsync(async(req, res) => {
  let page = res.locals.page;

  let posts = await postService.queryPosts({
    blog_id: res.locals.blog.id,
    status: 'published',    
    type: {
      [Op.not]: ['reply']
    }
  }, {
    order: [
      ['published_date', 'DESC']
    ],
    limit: res.locals.postsPerPage,
    offset: (page - 1) * res.locals.postsPerPage
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

  logger.debug(`lookup up post with slug ${slug} post: %o`, post);

  // If the post is not published, redirect to the blog page
  if (!post || !post.published_date || post.blog_id !== blog.id) {
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

const getReplies = catchAsync(async(req, res) => {  
  let blog = res.locals.blog;
  let posts = await postService.queryPosts({
    blog_id: blog.id,
    status: 'published',
    type: 'reply'
  }, {
    order: [
      ['published_date', 'DESC']
    ],
    limit: res.locals.postsPerPage,
    offset: (res.locals.page - 1) * res.locals.postsPerPage
  });
  res.render('pages/replies', {
    title: `Replies | ${blog.title}`,
    posts,
    blog
  });
});

const getArchive = catchAsync(async(req, res) => {
  let blog = res.locals.blog;
  let filter = {};

  let q = req.query.q || '';
  if (q && typeof q === 'string') {
    filter = {
      [Op.or]: [{
          title: {
            [Op.like]: `%${q}%`
          }
        },
        {
          content: {
            [Op.like]: `%${q}%`
          }
        },
        {
          tags_csv: {
            [Op.like]: `%${q}%`
          }
        }
      ]
    }
  }

  filter = {
    [Op.and]: [{
        blog_id: blog.id,
        status: 'published',
        type: {
          [Op.notIn]: ['page', 'reply']
        },
      },
      filter
    ]
  }

  let posts = await postService.queryPosts(filter, {
    order: [
      ['published_date', 'DESC']
    ]
  });
  res.render('pages/archive', {
    title: `Archive | ${blog.title}`,
    posts,
    blog
  });
});

module.exports = {
  index,
  getPost,
  getReplies,
  getArchive
}