'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.hasMany(models.Posts, {
      //   foreignKey: 'blog_id',
      //   as: 'posts'
      // });

      this.hasOne(models.Users, {
        foreignKey: 'blog_id',
        as: 'user'
      });
    }
  }
  Blog.init({
    title: DataTypes.STRING,
    url: {
      type: DataTypes.STRING,
      get: function() {
        // remove any trailing slash
        return this.getDataValue('url').replace(/\/$/, '').trim();
      }
    },
    naked_url: {
      type: DataTypes.VIRTUAL,
      get: function() {
        let url = this.getDataValue('url');
        url = url.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/:\d+$/, '').replace(/^www\./, '');
        url = url.split('?')[0];
        url = url.replace(/\/$/, '');
        return url;
      }
    },
    homepage_content: DataTypes.TEXT,
    homepage_content_html: DataTypes.TEXT,
    meta_description: DataTypes.TEXT,
    nav: DataTypes.TEXT,
    nav_html: DataTypes.TEXT,
    language: DataTypes.STRING,
    favicon: DataTypes.STRING,
    meta_image_url: DataTypes.STRING,
    external_stylesheet_url: DataTypes.STRING,
    custom_styles: DataTypes.TEXT,
    overwrite_styles: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Blogs'
  });
  return Blog;
};