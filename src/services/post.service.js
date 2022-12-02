const logger = require('../config/logger');
const SporeStore = require('../store');
const { slugify } = require('../utils/utils');

const savePost = async(postDoc) => {
  // handle categories
  if (postDoc.categories && postDoc.categories.length) {
    postDoc.categories = postDoc.categories.map((category) => {
      return {
        name: category,
        slug: slugify(category)
      };
    });
  }

  let categories = postDoc.categories;
  delete postDoc.categories;

  let media = postDoc.media;
  delete postDoc.media;

  let meta = postDoc.meta;
  delete postDoc.meta;

  logger.debug('Saving post to the database: %j', postDoc);
  let post = await SporeStore.savePost(postDoc);

  return post;
}

module.exports = {
  savePost,
};