const logger = require('../config/logger');
const ISporeStore = require('./interface');
const { slugify } = require('../utils/utils');

const SporeStore = class SporeStore extends ISporeStore {
  constructor() {
    super();
    this.db = require('./sqlite/models');
  }

  async init(callback) {
    callback();
  }

  // OAuth2
  async saveOAuthRequest(oauthRequest) {
    logger.info('Saving OAuth request: %j', oauthRequest);
    let request = await this.db.OAuthRequests.create(oauthRequest);
    return request;
  }

  async getOAuthRequestByCode(code) {
    logger.info('Getting OAuth request: %s', code);
    let request = await this.db.OAuthRequests.findOne({ where: { code: code } });
    return request;
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

  async savePost(postDoc) {
      logger.debug('Saving post to the database: %j', postDoc);
      let post = await this.db.Posts.create(postDoc);
      return post;
    }
    /*
        await DB().insert('posts', post);
        let postObj = DB().queryFirstRow('SELECT * FROM posts ORDER BY id DESC LIMIT 1');

        logger.debug('Saving categories: %j', post.categories);
        const date = new Date();
        const sqllite_date = date.toISOString();
        if (categories && typeof categories === 'object' && categories.length) {
          const stmt = DB().prepare('INSERT OR IGNORE INTO categories VALUES (@id, @name, @slug, @createdAt, @updatedAt)');
          for (let category of categories) {
            await stmt.run({ id: null, name: category.name, slug: category.slug, createdAt: sqllite_date, updatedAt: sqllite_date });
          }
          logger.debug('Saving post to categories: %d %j', post.id, post.categories);
          const stmt2 = DB().prepare('INSERT OR IGNORE INTO post_categories VALUES (@id, @postId, @categoryId, @createdAt, @updatedAt)');
          for (let category of categories) {
            let row = DB().queryFirstRow('SELECT * FROM categories WHERE slug = ?', category.slug);
            if (row) {
              await stmt2.run({ id: null, postId: postObj.id, categoryId: row.id, createdAt: sqllite_date, updatedAt: sqllite_date });
            }
          }
        }

        // enumerate the meta properties
        if (meta) {
          for (let key in meta) {
            if (meta.hasOwnProperty(key)) {
              let value = meta[key];
              if (typeof value === 'object') {
                // Single item arrays get squashed
                // Multi item arrays get stored as CSV
                if (Array.isArray(value)) {
                  if (value.length > 1) {
                    value = JSON.stringify(value);
                  } else {
                    value = value[0];
                  }
                } else {
                  // Objects are stored as JSON
                  value = JSON.stringify(value);
                }
              }
              if (key && value) {
                await DB().insert('post_meta', {
                  postId: postObj.id,
                  name: key,
                  value: value
                });
              }
            }
          }
        }

        // Enumerate the post photos
        if (media && media.photo && media.photo.length > 0) {
          for (let photo of media.photo) {
            let altText = '';
            if (typeof photo === 'object') {
              if (photo.alt) {
                altText = photo.alt;
              }
              photo = photo.value;
            } else {
              continue;
            }
            let filename = photo.split('/').pop();
            let media = await this.getMediaByFilename(filename);
            if (media) {
              await this.updateMedia({...media, postId: postObj.id, altText: altText });
            } else {
              await this.saveMedia({ postId: postObj.id, altText: altText, url: photo, type: 'photo' });
            }
          }
        }

        return postObj;
      }
    */
  getPostByPermalink = async(permalink) => {
    logger.debug('Getting post from the database: %s', permalink);
    let row = DB().queryFirstRow('SELECT * FROM posts WHERE permalink = ?', permalink);
    if (row) {
      return row;
    }
    return null;
  }

  saveBlogMeta = async(meta) => {
    logger.debug('Saving blog meta to the database: %j', meta);
    if (meta) {
      for (let key in meta) {
        if (meta.hasOwnProperty(key)) {
          let value = meta[key];
          if (typeof value === 'object') {
            // Single item arrays get squashed
            // Multi item arrays get stored as CSV
            if (Array.isArray(value)) {
              if (value.length > 1) {
                value = JSON.stringify(value);
              } else {
                value = value[0];
              }
            } else {
              // Objects are stored as JSON
              value = JSON.stringify(value);
            }
          }
          if (key) {

            // check if the meta already exists
            let row = DB().queryFirstRow('SELECT * FROM spore_meta WHERE name = ?', key);
            if (row) {
              // Delete the meta record if null is passed as the value
              if (value === null || value === '') {
                DB().delete('spore_meta', { id: row.id });
              } else {
                // Update the meta record
                DB().update('spore_meta', { value: value }, { name: key });
              }
            } else {
              // Insert the meta record
              DB().insert('spore_meta', {
                name: key,
                value: value
              });
            }
          }
        }
      }
    }
  }

  getBlogMeta = async(key = null) => {
    logger.debug('Getting blog meta from the database %s', key === null ? '[all]' : key);
    if (!key) {
      let rows = DB().query('SELECT * FROM spore_meta');
      if (rows) {
        return rows;
      }
      return null;
    } else {
      let row = DB().queryFirstRow('SELECT * FROM spore_meta WHERE name = ?', key);
      if (row) {
        return row.value;
      }
      return null;
    }
  }

  /**
   * Blog Methods
   */
  getBlog = async(include = ['user']) => {
    try {
      let blog = await this.db.Blogs.findOne({
        order: [
          ['id', 'DESC']
        ],
        include: include
      });
      return blog;
    } catch (err) {
      logger.error('Error getting blog: %s', err);
      return null;
    }
  }

  createBlog = async(blogMeta, userMeta) => {
    let blog = await this.db.Blogs.create(blogMeta);
    userMeta.blog_id = blog.id;
    await this.db.Users.create(userMeta);
    return await this.getBlog();
  }

  updateBlog = async(body) => {
    let blog = await this.getBlog();
    blog = await blog.update(body);
    return blog;
  }

  /**
   * User Methods
   */
  getUserByEmailOrUsername = async(emailOrUsername) => {
    let user = await this.db.Users.findOne({
      where: {
        [this.db.Sequelize.Op.or]: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    });
    return user;
  }

  updateUser = async(userId, body) => {
    let user = await this.db.Users.findOne({
      where: {
        id: userId
      }
    });
    user = await user.update(body);
    console.log(user);
    return user;
  }

  getUserById = async(userId) => {
    let user = await this.db.Users.findOne({
      where: {
        id: userId
      }
    });
    return user;
  }

}

module.exports = new SporeStore();