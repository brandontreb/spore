'use strict';
const crypto = require('crypto')
  // const bcrypt = require('bcrypt');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.belongsTo(models.Blogs, {
        foreignKey: 'blog_id',
        as: 'blog'
      });

      // this.hasMany(models.Posts, {
      //   foreignKey: 'user_id',
      //   as: 'posts'
      // });

    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      set: function(val) {
        this.setDataValue('email', val.toLowerCase());
      }
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      set: function(val) {
        this.setDataValue('username', val.toLowerCase());
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    full_name: DataTypes.STRING,
    website: DataTypes.STRING,
    about: DataTypes.TEXT,
    profile_photo: DataTypes.STRING,
    gravatar: {
      type: DataTypes.VIRTUAL,
      get() {
        return `https://www.gravatar.com/avatar/${this.email_hash}?s=100`;
      }
    },
    email_hash: {
      type: DataTypes.VIRTUAL,
      get() {
        return crypto.createHash('md5').update(this.email).digest('hex');
      }
    }
  }, {
    sequelize,
    modelName: 'Users',
  });

  return User;
};