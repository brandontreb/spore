const { decode } = require('html-entities');
const { NodeHtmlMarkdown } = require('node-html-markdown');
const { markdownToTxt } = require('markdown-to-txt');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});
const { convert } = require('html-to-text');

const processMicropubDocument = (micropubDocument) => {
  let name = '';
  let content_text = '';
  let content_md = '';
  let content_html = '';
  let status = 'published'
  let categories = [];
  let slug = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  let type = 'note';

  // Title
  if (micropubDocument.properties.name) {
    name = micropubDocument.properties.name[0];
  }

  // Content
  if (micropubDocument.properties.content) {
    let c = [].concat(micropubDocument.properties.content);
    let content = c;
    if (Array.isArray(c)) {
      content = c[0];
    } else {
      content_text = c;
    }
    if (typeof content === 'string') {
      content_text = content;
      content_md = content_text;
      content_html = md.render(content_md);
    } else if (typeof content === 'object') {
      if (content.html) {
        content_html = content.html;
        content_md = NodeHtmlMarkdown.translate(content_html);
        convert(content_html, {
          wordwrap: 130
        });
      }

      if (content.value) {
        content_text = content.value;
        content_md = content.value;
        content_html = md.render(content_md);
      }
    }

    content_text = decode(decodeURIComponent(content_text));
    content_md = decode(decodeURIComponent(content_md));
    content_html = decode(decodeURIComponent(content_html));
  }

  // Status
  if (micropubDocument.properties['post-status'] &&
    micropubDocument.properties['post-status'].length) {
    status = micropubDocument.properties['post-status'][0];
  }

  // Categories
  if (micropubDocument.properties.category &&
    micropubDocument.properties.category.length) {
    categories = micropubDocument.properties.category;
  }

  // Slug  
  if (micropubDocument.mp &&
    micropubDocument.mp.slug &&
    micropubDocument.mp.slug.length) {
    slug = micropubDocument.mp.slug[0];
  }

  type = getPostTypeFromBody(micropubDocument.properties);

  let post = {
    name,
    content_html,
    content_md,
    content_text,
    status,
    categories,
    slug,
    type,
  }

  // Handle any media
  let media = {};
  if (micropubDocument.properties.photo) {
    media.photo = micropubDocument.properties.photo;
  }
  post.media = media;

  return post;
}

const getPostTypeFromBody = (postBody) => {
  let type = 'note';
  // If a title is set, it's a post
  if (postBody.name && postBody.name.length && postBody.name[0].length) {
    type = 'article';
  }
  if (postBody['like-of']) {
    type = 'like';
  }
  if (postBody['repost-of']) {
    type = 'repost';
  }
  if (postBody['in-reply-to']) {
    type = 'reply';
  }
  if (postBody['bookmark-of']) {
    type = 'bookmark';
  }
  if (postBody['quotation-of']) {
    type = 'quotation';
  }
  if (postBody['photo']) {
    type = 'photo';
  }
  if (postBody['video']) {
    type = 'video';
  }
  if (postBody['audio']) {
    type = 'audio';
  }

  return type;
}

const reservedProperties = Object.freeze([
  'access_token',
  'q',
  'url',
  'update',
  'add',
  'delete'
]);

const formEncodedKey = /\[([^\]]*)]$/;

/**
 * @param {ParsedUrlQuery} body
 * @returns {ParsedMicropubStructure}
 */
const processFormEncodedBody = function(body) {
  /** @type {ParsedMicropubStructure} */
  const result = {
    type: body.h ? ['h-' + body.h] : undefined,
    properties: {},
    mp: {}
  };

  if (body.h) {
    delete body.h;
  }

  for (let key in body) {
    const rawValue = body[key];

    if (reservedProperties.includes(key)) {
      result[key] = rawValue;
    } else {
      /** @type {Object<string,any[]>} */
      let targetProperty;
      /** @type {string|string[]|Object<string,any>} */
      let value = rawValue;
      let subKey;

      while ((subKey = formEncodedKey.exec(key))) {
        if (subKey[1]) {
          /** @type {Object<string,any>} */
          const tmp = {};
          tmp[subKey[1]] = value;
          value = tmp;
        } else {
          value = ensureArrayAndCloneIt(value);
        }
        key = key.slice(0, subKey.index);
      }

      if (key.startsWith('mp-')) {
        key = key.slice(3);
        targetProperty = result.mp;
      } else {
        targetProperty = result.properties;
      }

      targetProperty[key] = ensureArrayAndCloneIt(value);
    }
  }

  cleanEmptyKeys(result);

  return result;
};

/**
 * @param {Object<string,any>} body
 * @returns {ParsedMicropubStructure}
 */
const processJsonEncodedBody = function(body) {
  /** @type {ParsedMicropubStructure} */
  const result = {
    properties: {},
    mp: {}
  };

  for (let key in body) {
    const value = body[key];

    if (reservedProperties.includes(key) || ['properties', 'type'].includes(key)) {
      result[key] = value;
    } else if (key.startsWith('mp-')) {
      key = key.slice(3);
      result.mp[key] = [].concat(value);
    }
  }

  for (const key in body.properties) {
    if (['url'].includes(key)) {
      result[key] = result[key] || [].concat(body.properties[key])[0];
      delete body.properties[key];
    }
  }

  cleanEmptyKeys(result);

  return result;
};

/**
 * @param {Object<string,any>} result
 */
const cleanEmptyKeys = function(result) {
  for (const key in result) {
    if (typeof result[key] === 'object' && Object.getOwnPropertyNames(result[key])[0] === undefined) {
      delete result[key];
    }
  }
};

/**
 * @template T
 * @param {MaybeArray<T>} value
 * @returns {T[]}
 */
const ensureArrayAndCloneIt = (value) => Array.isArray(value) ? [...value] : [value];


module.exports = {
  processJsonEncodedBody,
  processFormEncodedBody,
  processMicropubDocument,
};