// import the store
const passwordHash = require('password-hash');
const logger = require('../config/logger');
const utils = require('../utils/utils');
const pick = require('../utils/pick');
const SporeStore = require('../store');
const userService = require('./user.service');

const saveBlogMeta = async(meta) => {
  // if meta has a password key, hash it
  if (meta.password) {
    if (meta.password.trim().length > 0) {
      console.log('Hashing password of length %d', meta.password.length);
      meta.password = passwordHash.generate(meta.password);
      delete meta.password_again;
    } else {
      delete meta.password;
      delete meta.password_again;
    }
  } else {
    delete meta.password;
    delete meta.password_again;
  }

  // If meta has email key, prepare it for storage
  if (meta.email) {
    meta.email = meta.email.trim().toLowerCase();
  }

  // If meta has username key, prepare it for storage
  if (meta.username) {
    meta.username = meta.username.trim().toLowerCase();
  }



  logger.info('Saving blog meta: %o', meta);

  // Save the meta
  await SporeStore.saveBlogMeta(meta);
}

const getBlog = async() => {
  // Get the meta
  let blog = await SporeStore.getBlog();
  if (!blog) {
    return null;
  }

  // If meta has a password key, remove it
  // if (meta.password) {
  //   delete meta.password;
  // }

  // // Create a blog object
  // let blog = {};
  // // Enumerate the meta keys  
  // for (let i = 0; i < meta.length; i++) {
  //   let name = meta[i].name;
  //   blog[name] = meta[i].value;
  // }

  // Set the gravatar  

  // Return the meta
  return blog;
}

const createBlog = async(body) => {
  // Save the meta
  let blogMeta = pick(body, ['title', 'url']);
  let userMeta = pick(body, ['username', 'email', 'password']);
  userMeta.password = passwordHash.generate(userMeta.password);

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
  let blogMeta = pick(body, ['title', 'url', 'homepage_content', 'homepage_content_html', 'meta_description', 'language', 'nav', 'nav_html', 'favicon']);
  // If meta has a url key, prepare it for storage
  if (blogMeta.url) {
    blogMeta.url = utils.normalizeUrl(blogMeta.url);
  }
  await SporeStore.updateBlog(blogMeta);
}

const loginWithEmailAndPassword = async(email, password) => {
  // // Get the meta
  // let blogBlogEmail = await SporeStore.getBlogMeta("email");
  // let blogPassword = await SporeStore.getBlogMeta("password");

  // console.log('Blog email: %s', blogBlogEmail);
  // console.log('Blog password: %s', blogPassword);
  // console.log(passwordHash.verify(password, blogPassword))

  // // If the email and password match, return true
  // if (blogBlogEmail && blogPassword) {
  //   if (blogBlogEmail === email && passwordHash.verify(password, blogPassword)) {
  //     return true;
  //   }
  // }

  // // Otherwise, return false
  // return false;
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