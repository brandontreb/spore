'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Media extends Model {
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
  Media.init({
    post_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    original_filename: DataTypes.STRING,
    path: DataTypes.STRING,
    mime_type: DataTypes.STRING,
    filename: DataTypes.STRING,
    size: DataTypes.INTEGER,
    alt_text: DataTypes.STRING,
    url: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Media',
  });
  return Media;
};