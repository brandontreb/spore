const DB = require('better-sqlite3-helper');
const logger = require('../config/logger');
const ISporeStore = require('./interface');

const SporeStore = class SporeStore extends ISporeStore {
  constructor() {
    super();
    this.db = null;
  }

  async init(callback) {
    logger.info('Initializing the database: SQLite');
    let row = DB().query('SELECT * FROM oAuth2Requests');
    if (row) {
      console.log(row);
    }
    callback();
  }

  // OAuth2
  async saveOAuth2Request(oAuth2Request) {
    logger.info('Saving OAuth2 request: %j', oAuth2Request);
    DB().insert('oAuth2Requests', oAuth2Request);
  }

  async getOAuth2RequestByCode(code) {
    logger.info('Getting OAuth2 request: %s', code);
    let row = DB().queryFirstRow('SELECT * FROM oAuth2Requests WHERE code = ?', code);
    if (row) {
      return row;
    }
    return null;
  }

  // Media
  async saveMedia(media) {
    logger.info('Saving media: %j', media);
    DB().insert('media', media);
    let row = DB().queryFirstRow('SELECT * FROM media ORDER BY id DESC LIMIT 1');
    return row;
  }

  async getMediaById(id) {
    logger.info('Getting media: %s', id);
    let row = DB().queryFirstRow('SELECT * FROM media WHERE id = ?', id);
    if (row) {
      return row;
    }
    return null;
  }

  async getMediaByFilename(filename) {
    logger.info('Getting media: %s', filename);
    let row = DB().queryFirstRow('SELECT * FROM media WHERE filename = ?', filename);
    if (row) {
      return row;
    }
    return null;
  }

  async updateMedia(media) {
    logger.info('Updating media: %j', media);
    DB().update('media', media, { id: media.id });
    let row = DB().queryFirstRow('SELECT * FROM media WHERE id = ?', media.id);
    return row;
  }

  async savePost(post) {
    logger.debug('Saving post to the database: %j', post);

    let categories = post.categories;
    delete post.categories;
    delete post.media;
    DB().insert('posts', post);
    let postObj = DB().queryFirstRow('SELECT * FROM posts ORDER BY id DESC LIMIT 1');

    logger.debug('Saving categories: %j', post.categories);
    const date = new Date();
    const sqllite_date = date.toISOString();
    const stmt = DB().prepare('INSERT OR IGNORE INTO categories VALUES (@id, @blogId, @name, @slug, @createdAt, @updatedAt)');
    for (let category of categories) {
      stmt.run({ id: null, blogId: category.blogId, name: category.name, slug: category.slug, createdAt: sqllite_date, updatedAt: sqllite_date });
    }
    logger.debug('Saving post to categories: %d %j', post.id, post.categories);
    const stmt2 = DB().prepare('INSERT OR IGNORE INTO post_categories VALUES (@id, @postId, @blogId, @categoryId, @createdAt, @updatedAt)');
    for (let category of categories) {
      let row = DB().queryFirstRow('SELECT * FROM categories WHERE blogId = ? AND slug = ?', category.blogId, category.slug);
      if (row) {
        console.log(row);
        console.log({ id: null, blogId: postObj.blogId, postId: postObj.id, categoryId: row.id, createdAt: sqllite_date, updatedAt: sqllite_date })
        stmt2.run({ id: null, blogId: postObj.blogId, postId: postObj.id, categoryId: row.id, createdAt: sqllite_date, updatedAt: sqllite_date });
      }
    }


    return postObj;
  }

  getPostByPermalink = async(permalink) => {
    logger.debug('Getting post from the database: %s', permalink);
    let row = DB().queryFirstRow('SELECT * FROM posts WHERE permalink = ?', permalink);
    if (row) {
      return row;
    }
    return null;
  }
}

module.exports = new SporeStore();