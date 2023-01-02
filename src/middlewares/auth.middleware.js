const config = require('../config/config');
const httpStatus = require('http-status');
const logger = require('../config/logger');
const { blogService } = require('../services');

const auth = (required) => async(req, res, next) => {
  console.log(req.body)
  // If the blog doesn't exist, Spore must be installed
  let blog = await blogService.getBlog();
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

  // Hydrate the locals with the blog/user data

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