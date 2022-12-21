// import the store
const passwordHash = require('password-hash');
const logger = require('../config/logger');
const utils = require('../utils/utils');
const pick = require('../utils/pick');
const SporeStore = require('../store');
const userService = require('./user.service');

const getBlog = async() => {
  let blog = await SporeStore.getBlog();
  if (!blog) {
    logger.error('Blog not found');
    return null;
  }
  return blog;
}

const createBlog = async(body) => {
  // Save the meta
  let blogMeta = pick(body, ['title', 'url']);
  let userMeta = pick(body, ['username', 'email', 'password']);

  // Hash the password
  userMeta.password = passwordHash.generate(userMeta.password);
  // Generate acct which is username@domain
  userMeta.acct = `${userMeta.username}@${utils.nakedUrl(blogMeta.url)}`;

  // Set the blog defaults
  blogMeta = {
    ...blogMeta,
    homepage_content: '# Welcome to my spore.blog\n\nChange this content in the dashboard.',
    homepage_content_html: '<h1> Welcome to my spore.blog</h1><p>Change this content in the dashboard.</p>',
    meta_description: 'A new blog for my spore.blog',
    language: 'en',
    nav: '[Home](/)\n[Archive](/archive/)\n[Replies](/replies/)',
    nav_html: '<a href="/">Home</a>\n<a href="/archive">Archive</a>\n<a href="/replies/">Replies</a>',
    favicon: '🌱'
  }

  await SporeStore.createBlog(blogMeta, userMeta);
}

const updateBlog = async(body) => {
  // Save the meta
  let blogMeta = pick(body, [
    'title', 'url', 'homepage_content', 'homepage_content_html', 'meta_description',
    'language', 'nav', 'nav_html', 'favicon'
  ]);
  // Cache the HTML of the nav markdown for faster loading
  if (blogMeta.nav) {
    blogMeta.nav_html = utils.markdownToHtml(blogMeta.nav);
  }
  // If meta has a url key, prepare it for storage
  if (blogMeta.url) {
    blogMeta.url = utils.normalizeUrl(blogMeta.url);
  }
  await SporeStore.updateBlog(blogMeta);
}

const loginWithEmailAndPassword = async(email, password) => {
  // Look up the user by email or username
  let user = await userService.getUserByEmailOrUsername(email);
  if (user) {
    if (passwordHash.verify(password, user.password)) {
      return true;
    }
  }
  return false;
}

module.exports = {
  updateBlog,
  getBlog,
  loginWithEmailAndPassword,
  createBlog
}