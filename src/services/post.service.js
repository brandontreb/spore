const logger = require('../config/logger');
const SporeStore = require('../store');
const { slugify } = require('../utils/utils');
const mediaService = require('./media.service');

const createPost = async(postDoc) => {
  // handle categories
  if (postDoc.categories && postDoc.categories.length) {
    postDoc.categories = postDoc.categories.map((category) => {
      return {
        name: category,
        slug: slugify(category)
      };
    });
  }

  // Create local copy of relationships
  postDoc.tags_csv = postDoc.tags;
  let tags = postDoc.tags.split(',').map((tag) => {
    return {
      name: tag,
      slug: slugify(tag)
    };
  });
  delete postDoc.tags;
  let media = postDoc.media;
  delete postDoc.media;
  let meta = postDoc.meta;
  delete postDoc.meta;

  logger.debug('Saving post to the database: %j', postDoc);
  let post = await SporeStore.createPost(postDoc);

  // Save post.media
  logger.debug('Saving media: %j', media);
  if (media && media.photo && media.photo.length > 0) {

    for (let photo of media.photo) {
      let alt_text = '';
      if (typeof photo === 'object') {
        if (photo.alt) {
          alt_text = photo.alt;
        }
        photo = photo.value;
      }
      let filename = photo.split('/').pop();
      let media = await mediaService.getMediaByFilename(filename);
      if (media) {
        await mediaService.updateMedia(media.id, {...media, post_id: post.id, alt_text: alt_text });
      } else {
        await mediaService.createMedia({ post_id: post.id, alt: alt_text, url: photo, type: 'photo' });
      }
    }
  }

  // Save tags
  logger.debug('Saving tags: %j', tags);
  if (tags && typeof tags === 'object' && tags.length) {
    for (let i = 0; i < tags.length; i++) {
      let tagDoc = tags[i];
      let tag = await SporeStore.createTag(tagDoc);
      await SporeStore.createPostTag(post.id, tag.id);
    }
  }

  // Save meta
  logger.debug('Saving meta: %j', meta);
  if (meta && typeof meta === 'object' && Object.keys(meta).length) {
    for (let key in meta) {
      let metaDoc = {
        key: key,
        value: meta[key]
      };
      await SporeStore.createPostMeta(post.id, metaDoc);
    }
  }

  post = await SporeStore.getPostById(post.id);

  return post;
}

const queryPosts = async(filter, options) => {
  if (!options) {
    options = {};
  }
  if (!options.include) {
    options.include = [];
  } else if (!typeof options.include === 'array') {
    options.include = [options.include];
  }
  options.include = ['blog', 'media', 'post_meta', 'tags', ...options.include];

  let posts = await SporeStore.queryPosts(filter, options);
  return posts;
}

const getPostById = async(id) => {
  let post = await SporeStore.getPostById(id);
  return post;
}

const getPostBySlug = async(slug) => {
  let post = await SporeStore.getPostBySlug(slug);
  return post;
}

const getPostByPermalink = async(permalink) => {
  let post = await SporeStore.getPostByPermalink(permalink);
  return post;
}

module.exports = {
  createPost,
  queryPosts,
  getPostById,
  getPostBySlug,
  getPostByPermalink
};