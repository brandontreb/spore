const normalizeUrl = (url) => {
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
}

module.exports = {
  normalizeUrl
}