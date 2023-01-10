const config = require('../config/config');
const logger = require('../config/logger');
const { blogService } = require('../services');

const auth = (required) => async(req, res, next) => {
  // The id of the blog is passed in the query string or its the only blog installed (id = 1)
  // Eventually, we will have multiple blogs per installation and it will be pulled up by subdomain
  let blogId = req.query.blog_id || 1;  

  // If the user is in the admin, get the blog id from the session
  // Also, if the user is doing indie auth get the blog id from the session
  if (req.originalUrl.startsWith('/admin') || req.originalUrl.startsWith('/indieWeb/indieAuth')) {
    blogId = req.session.blog_id;
  }

  logger.debug(`Looking up blog with id: ${blogId}`);  

  let blog = await blogService.getBlog(blogId);  

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


  // TODO: Add a blog config for theme
  let theme = {
    name: 'default',
    slug: 'default',
  }

  // TODO: Add a blog config for webmtion.io
  // TODO: Add a blog config for micro.blog
  theme.head = `     
    <!-- Feeds -->  
    <link rel="alternate" type="application/json" title="${blog.user.username}" href="${blog.url}/feed.json" />
    <link rel="alternate" type="application/rss+xml" href="/feed.xml" />    
    <!-- Indie Web -->
    <link rel="me" href="mailto:${blog.user.email}">
    <link rel="me" href="https://micro.blog/${blog.user.username}">
    <link rel="authorization_endpoint" href="${blog.url}/indieWeb/indieAuth/authorize">
    <link rel="token_endpoint" href="${blog.url}/indieWeb/indieAuth/token">
    <link rel="micropub" href="${blog.url}/indieWeb/micropub">
    <link rel="webmention" href="https://webmention.io/${blog.naked_url}/webmention" />
    <link rel="pingback" href="https://webmention.io/${blog.naked_url}/xmlrpc" />      
    <!-- Styles -->
    <link rel="stylesheet" href="/data/themes/${theme.slug}/${theme.slug}.css">       
    <!-- Scripts -->
    <script id="script_conversation" data-blog_url="${blog.naked_url}" src="/scripts/conversation.js"></script>
    `;

  res.locals = {
    ...res.locals,
    blog,
    theme,
    page: parseInt(req.query.page) || 1,
    postsPerPage: 25, // TODO: Make this configurable
  }
  next();
};

module.exports = auth;