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
    return { id: 1 };
  }
}

module.exports = new SporeStore();