const normalizeUrl = (url) => {
  url = url.trim();
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
}

const slugify = str =>
  str
  .toLowerCase()
  .trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '');

const getGravatar = (email) => {
  const md5 = require('md5');
  return `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}`;
};

module.exports = {
  normalizeUrl,
  slugify,
  getGravatar,
}