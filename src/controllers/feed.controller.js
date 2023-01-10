const catchAsync = require('../utils/catchAsync');
const { postService } = require('../services');
const { Op } = require('sequelize');

const xml = catchAsync(async(req, res) => {
  const blog = res.locals.blog;
  const posts = await postService.queryPosts({
    blog_id: blog.id,
    status: 'published',
    type: {
      [Op.notIn]: ['page', 'reply']
    },
  }, {
    order: [
      ['published_date', 'DESC'],
    ],
    limit: 10,
    include: [
      'media',
      'blog'
    ]
  });

  res.setHeader("Content-Type", "application/xml");
  res.render('feeds/xml', {
    blog,
    posts,
  });
});

const json = catchAsync(async(req, res) => {
  const blog = res.locals.blog;
  const posts = await postService.queryPosts({
    blog_id: blog.id,
    status: 'published',    
    type: {
      [Op.notIn]: ['page', 'reply']
    },
  }, {
    order: [
      ['published_date', 'DESC'],
    ],
    limit: 10,
    include: [
      'media',
      'blog'
    ]
  });

  let response = {
    version: 'https://jsonfeed.org/version/1',
    title: blog.title,
    home_page_url: blog.url,
    feed_url: `${blog.url}/feed.json`
  };

  let items = [];
  posts.forEach((post) => {
    let tags = post.tags.map((tag) => tag.name);
    tags = tags.filter((tag) => tag.length !== 0);

    let item = {
      id: post.url,
      url: post.url,
      content_html: post.html_with_media,
      date_published: post.published_date,
      date_modified: post.updatedAt,
    };
    if (tags) {
      item.tags = tags;
    }
    if (post.type === 'article') {
      item.title = post.title;
    }
    items.push(item);
  });

  response.items = items;

  res.setHeader("Content-Type", "application/json");
  res.send(response);

});

module.exports = {
  xml,
  json
}