// import the store
const passwordHash = require('password-hash');
const logger = require('../config/logger');
const utils = require('../utils/utils');
const SporeStore = require('../store');

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

  // If meta has a blog_url key, prepare it for storage
  if (meta.blog_url) {
    meta.blog_url = utils.normalizeUrl(meta.blog_url);
  }

  logger.info('Saving blog meta: %o', meta);

  // Save the meta
  await SporeStore.saveBlogMeta(meta);
}

const getBlog = async() => {
  // Get the meta
  let meta = await SporeStore.getBlogMeta();

  // If meta has a password key, remove it
  if (meta.password) {
    delete meta.password;
  }

  // Create a blog object
  let blog = {};
  // Enumerate the meta keys  
  for (let i = 0; i < meta.length; i++) {
    let name = meta[i].name;
    blog[name] = meta[i].value;
  }

  // Set the gravatar
  blog.gravatar = utils.getGravatar(blog.email);

  // Return the meta
  return blog;
}

const loginWithEmailAndPassword = async(email, password) => {
  // Get the meta
  let blogBlogEmail = await SporeStore.getBlogMeta("email");
  let blogPassword = await SporeStore.getBlogMeta("password");

  console.log('Blog email: %s', blogBlogEmail);
  console.log('Blog password: %s', blogPassword);
  console.log(passwordHash.verify(password, blogPassword))

  // If the email and password match, return true
  if (blogBlogEmail && blogPassword) {
    if (blogBlogEmail === email && passwordHash.verify(password, blogPassword)) {
      return true;
    }
  }

  // Otherwise, return false
  return false;
}

module.exports = {
  saveBlogMeta,
  getBlog,
  loginWithEmailAndPassword
}