const normalizeUrl = (url) => {
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

module.exports = {
  normalizeUrl,
  slugify
}