'use strict';

const moment = require('moment');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});
const { encode } = require('html-entities');
const { markdownToTxt } = require('markdown-to-txt');
const cheerio = require('cheerio');

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {

    static associate(models) {
      // define association here
      this.belongsTo(models.Users, {
        foreignKey: 'user_id',
        as: 'author'
      });

      this.belongsTo(models.Blogs, {
        foreignKey: 'blog_id',
        as: 'blog'
      });

      this.hasMany(models.Media, {
        foreignKey: 'post_id',
        as: 'media'
      });

      this.belongsToMany(models.Tags, {
        through: "Post_Tags",
        foreignKey: 'post_id',
        as: 'tags'
      });

      this.hasMany(models.Post_Meta, {
        foreignKey: 'post_id',
        as: 'post_meta'
      });
    }
  }
  Posts.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    uri: {
      type: DataTypes.STRING
    },
    blog_id: {
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.STRING
    },
    content: {
      type: DataTypes.TEXT
    },
    text: {
      type: DataTypes.TEXT
    },
    html: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'future', 'private', 'trash')
    },
    slug: {
      type: DataTypes.STRING
    },
    permalink: {
      type: DataTypes.STRING
    },
    meta_description: {
      type: DataTypes.STRING
    },
    meta_image_url: {
      type: DataTypes.STRING
    },
    tags_csv: {
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'note'
    },
    webmention_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    show_in_feed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    published_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    links: {
      type: DataTypes.VIRTUAL,
      get() {
        const html = this.html;
        if(!html) return [];
        const $ = cheerio.load(html);
        const linkObjects = $('a');
        const links = [];
        for (let i = 0; i < linkObjects.length; i++) {
          const link = linkObjects[i];
          const href = link.attribs.href;
          links.push(href);
        }

        if (this.type === 'reply') {
          let meta = this.post_meta;
          if (meta) {
            let reply = meta.find(m => m.name === 'in-reply-to');
            if (reply) {
              links.push(reply.value);
            }
          }
        }

        return links;
      }
    },
    url: {
      type: DataTypes.VIRTUAL,
      get() {
        let base = this.blog ? this.blog.url : '';
        // check if this.permaLink starts with a slash
        let slash = this.permalink && this.permalink.startsWith('/') ? '' : '/';
        return `${base}${slash}${this.permalink}`;
      }
    },
    html_with_media: {
      type: DataTypes.VIRTUAL,
      get() {
        let content = this.html;

        if (this.media) {
          for (let media of this.media) {
            content = `${content}\n\n<p><img class="u-photo" src="${this.blog.url}/${media.path}" alt="${media.alt_text || ""}"></p>`;
          }
        }
        return content ? md.render(content) : '';
      },
    },
    html_with_media_encoded: {
      type: DataTypes.VIRTUAL,
      get() {
        return encode(this.html_with_media);
      },
    },
  }, {
    sequelize,
    modelName: 'Posts',
  });

  Posts.prototype.getMeta = function(key) {
    let meta = this.post_meta;
    if (meta) {
      for (let m of meta) {
        if (m.name == key) {
          return m.value;
        }
      }
    }
    return null;
  }

  Posts.prototype.published_date_formatted = function(format) {
    return `${moment(this.published_date).utcOffset('-800').format(format)}`;
  }

  return Posts;
};
/*
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    excerpt: DataTypes.STRING,    
    status: DataTypes.ENUM('draft', 'published', 'future', 'private', 'trash'),
    slug: DataTypes.STRING,
    permalink: DataTypes.STRING,
    meta_description: DataTypes.STRING,
    meta_image_url: DataTypes.STRING,
    mentioned: DataTypes.TEXT,
    toMention: DataTypes.TEXT,      
    tags: DataTypes.STRING,    
    type: DataTypes.STRING,
    webmentionCount: DataTypes.INTEGER,    
    show_in_feed: DataTypes.BOOLEAN,        
    published_date: DataTypes.DATE,  
    published_date_formatted: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${moment(this.published_date).utcOffset(0, false).format("DD MMM, YYYY")}`;
      },
      set(value) {
        throw new Error('Do not try to set the `published_date_formatted` value!');
      }
    },
    published_date_formatted_rss: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${moment(this.published_date).utcOffset(0, false).format("ddd, DD MMM YYYY HH:mm:ss")} +0800`;
      },
    },
    published_date_formatted_picker: {
      type: DataTypes.VIRTUAL,
      get() {        
        return `${moment(this.published_date).utcOffset(0, false).format("YYYY-MM-DD")}`;
      },
    },
    content_html: {
      type: DataTypes.VIRTUAL,
      get() {
        let content = this.content;      
        return md.render(content);
      },
    },
    content_html_with_media: {
      type: DataTypes.VIRTUAL,
      get() {
        let content = this.content_html;      
    
        if(this.media) {
          for(let media of this.media) {
            content =`${content}\n\n<p><img class="u-photo" src="${this.blog.url}/${media.path}" alt="${media.altText || ""}"></p>`;
          }
        }
        return md.render(content);
      },
    },
    content_text: {
      type: DataTypes.VIRTUAL,
      get() {
        return markdownToTxt(this.content);
      }
    },
    content_html_encoded: {
      type: DataTypes.VIRTUAL,
      get() {
        return encode(this.content_html);
      },
    },
    content_html_with_media_encoded: {
      type: DataTypes.VIRTUAL,
      get() {
        return encode(this.content_html_with_media);
      },
    },
    url: {
      type: DataTypes.VIRTUAL,
      get() {        
        return `${this.blog.url}${this.permalink}`;
      }
    },
    meta: {
      type: DataTypes.VIRTUAL,
      get() {
        // convert post.meta to key value
        let meta = {};
        if (this.post_meta) {
          this.post_meta.forEach(item => {
            meta[item.key] = item.value;
          } );
        }
        return meta;
      }
    },
    links: {
      type: DataTypes.VIRTUAL,
      get() {
        const html = this.content_html;
        const $ = cheerio.load(html);
        const linkObjects = $('a');
        const links = [];
        for(let i = 0; i < linkObjects.length; i++) {
          const link = linkObjects[i];
          const href = link.attribs.href;          
          links.push(href);
        }
        // TODO: Refactor to micropub service
        if(this.type === 'reply') {   
          let reply = this.post_meta.find(item => item.key === 'in-reply-to');                   
          if(reply) {
            reply = reply.value;
            links.push(reply);
          }
        }

        return links;
      }
    }
  }, {
    sequelize,
    modelName: 'Posts',
  });

  Posts.prototype.getMeta = function (key) {
    // console.log(`checking meta for ${key}`);
    // console.log(this.meta)
    // console.log(this.meta[key])
    let meta = this.meta;
    if(key in meta) {
      return meta[key];
    }
    return null;
  }

  return Posts;
};*/