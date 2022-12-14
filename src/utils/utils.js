const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { convert } = require('html-to-text');

const normalizeUrl = (url) => {
  url = url.trim();
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
}

const nakedUrl = (url) => {
  url = url.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/:\d+$/, '').replace(/^www\./, '');
  url = url.split('?')[0];
  url = url.replace(/\/$/, '');
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

const markdownToHtml = (markdown) => {
  let decoded = HTMLDecoderEncoder.decode(markdown);
  return md.render(decoded);
};

const markdownToText = (markdown) => {
  let decoded = convert(markdownToHtml(markdown), {
    wordwrap: 130
  });
  return decoded;;
};

module.exports = {
  normalizeUrl,
  slugify,
  getGravatar,
  markdownToHtml,
  markdownToText,
  nakedUrl,
}