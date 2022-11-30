'use strict';
const crypto = require('crypto')
const PROTECTED_ATTRIBUTES = ['password', 'createdAt', 'updatedAt'];
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

    toJSON() {
      // hide protected fields
      let attributes = Object.assign({}, this.get());
      for (let a of PROTECTED_ATTRIBUTES) {
        delete attributes[a];
      }
      return attributes;
    }
  };

  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      set: function(val) {
        this.setDataValue('email', val.trim().toLowerCase());
      }
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      set: function(val) {
        this.setDataValue('username', val.trim().toLowerCase());
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    acct: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set: function(val) {
        this.setDataValue('acct', val.trim().toLowerCase());
      }
    },
    post_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    display_name: DataTypes.STRING,
    website: DataTypes.STRING,
    note: DataTypes.TEXT,
    avatar: DataTypes.STRING,
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