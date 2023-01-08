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

  /*
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
  */

  async createPost(postDoc) {
    logger.debug('Saving post to the database: %j', postDoc);
    let post = await this.db.Posts.create(postDoc,

      {
        include: ["media", "blog", "post_meta", "tags"]
      })
    return post;
  }

  async updatePost(id, postDoc) {
    logger.debug('Updating post to the database: %j', postDoc);
    await this.db.Posts.update(postDoc, {
      where: {
        id: id
      }
    });
    return this.getPostById(id);    
  }

  queryPosts = async(filter, options) => {
    if (!options) {
      options = {};
    }
    if (!options.include) {
      options.include = [];
    } else if (!typeof options.include === 'array') {
      options.include = [options.include];
    }

    let posts = await this.db.Posts.findAll({
      where: filter,
      ...options,
    });
    return posts;
  };

  getPostById = async(id, include = ["media", "blog", "post_meta", "tags"]) => {
    let post = await this.db.Posts.findOne({
      where: {
        id,
      },
      include: include
    });
    return post;
  }

  getPostBySlug = async(slug, include = ["media", "blog", "post_meta", "tags"]) => {
    let post = await this.db.Posts.findOne({
      where: {
        slug,
      },
      include: include
    });
    return post;
  }

  getPostByPermalink = async(permalink, include = ["media", "blog", "post_meta", "tags"]) => {
    let post = await this.db.Posts.findOne({
      where: {
        permalink,
      },
      include: include
    });
    return post;
  }

  deletePost = async(id) => {
    let post = await this.db.Posts.destroy({
      where: {
        id,
      },
    });
    return post;
  };

  /**
   * Media
   *  
   */

  createMedia = async(media) => {
    logger.debug('Saving media to the database: %j', media);
    let mediaObj = await this.db.Media.create(media);
    return mediaObj;
  };

  getMediaById = async(id) => {
    let media = await this.db.Media.findOne({
      where: {
        id,
      },
    });
    return media;
  };

  getMediaByFilename = async(filename) => {
    let media = await this.db.Media.findOne({
      where: {
        filename,
      },
    });
    return media;
  };

  updateMedia = async(id, media) => {
    logger.debug('Updating media in the database: %j', media);
    let mediaObj = await this.db.Media.update(media, {
      where: {
        id: id,
      },
    });
    return mediaObj;
  };

  queryMedia = async(filter, options) => {
    if (!options) {
      options = {};
    }
    if (!options.include) {
      options.include = [];
    } else if (!typeof options.include === 'array') {
      options.include = [options.include];
    }

    let media = await this.db.Media.findAll({
      where: filter,
      ...options,
    });
    return media;
  };

  /**
   * Tags    
   */

  createTag = async(tag) => {
    logger.debug('Saving tag to the database: %j', tag);
    let existingTag = await this.db.Tags.findOne({
      where: {
        slug: tag.slug,
      },
    });
    if (existingTag) {
      return existingTag;
    }
    let tagObj = await this.db.Tags.create(tag);
    return tagObj;
  };

  getAllTags = async(blogId) => {
    // TODO: Add blog_id to tags
    let tags = await this.db.Tags.findAll();
    return tags;
  };

  createPostTag = async(postId, tagId) => {
    logger.debug('Saving tag to post to the database: %j,  %j', postId, tagId);
    let existingPostTag = await this.db.Post_Tags.findOne({
      where: {
        tag_id: tagId,
        post_id: postId,
      },
    });
    if (existingPostTag) {
      return existingPostTag;
    }
    let postTag = await this.db.Post_Tags.create({
      tag_id: tagId,
      post_id: postId,
    });
    return postTag;
  };

  /**
   * PostMeta
   **/
  createPostMeta = async(postId, meta) => {
    logger.debug('Saving post meta to the database: %j', meta);
    if (meta && meta.value && (meta.key || meta.name)) {
      let key = meta.key || meta.name;
      let value = meta.value;

      if (typeof value === 'object') {        
        // Single item arrays get squashed
        // Multi item arrays get stored as CSV
        if (Array.isArray(value)) {          
          if (value.length > 1) {
            value = JSON.stringify(value);
          } else {
            value = value[0];
            if (typeof value === 'object') {
              value = JSON.stringify(value);
            }
          }
        } else {
          // Objects are stored as JSON
          value = JSON.stringify(value);
        }
      }      
      let postMeta = await this.db.Post_Meta.create({
        post_id: postId,
        name: key,
        value,
      });
      return postMeta
    }
    return null;
  };

  getPostMeta = async(postId, key = null) => {
    let postMeta = null;
    if (key) {
      postMeta = await this.db.Post_Meta.findOne({
        where: {
          post_id: postId,
          name: key,
        },
      });
    } else {
      postMeta = await this.db.Post_Meta.findAll({
        where: {
          post_id: postId,
        },
      });
    }
    return postMeta;
  };


  /*saveBlogMeta = async(meta) => {
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
  }*/

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