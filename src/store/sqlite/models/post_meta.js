'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostMeta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Posts, {
        foreignKey: 'post_id',
        as: 'post'
      });
    }
  }
  PostMeta.init({
    post_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Post_Meta',
  });
  return PostMeta;
};