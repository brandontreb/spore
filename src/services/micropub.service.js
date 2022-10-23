const { decode } = require('html-entities');

const processMicropubDocument = (micropubDocument) => {
  let title = '';
  let content = '';
  let status = 'published'
  let categories = [];
  let slug = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  let type = 'note';

  // Title
  if (micropubDocument.properties.name) {
    title = micropubDocument.properties.name[0];
  }

  // Content
  if (micropubDocument.properties.content) {
    let c = [].concat(micropubDocument.properties.content);
    if (Array.isArray(c)) {
      content = c[0];
    } else {
      content = c;
    }
    if (content.html) {
      content = content.html;
    }
    if (content.value) {
      content = content.value;
    }
    content = decode(decodeURIComponent(content));
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
  if (micropubDocument.properties['mp-slug'] &&
    micropubDocument.properties['mp-slug'].length) {
    slug = micropubDocument.properties['mp-slug'][0];
  }

  type = getPostTypeFromBody(micropubDocument.properties);

  let post = {
    title,
    content,
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