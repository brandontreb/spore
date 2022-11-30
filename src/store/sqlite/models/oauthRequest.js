'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OAuthRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OAuthRequest.init({
    client_id: DataTypes.STRING,
    response_type: DataTypes.STRING,
    grant_type: DataTypes.STRING,
    redirect_uri: DataTypes.STRING,
    scope: DataTypes.STRING,
    code_challenge: DataTypes.STRING,
    code_challenge_method: DataTypes.STRING,
    code: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    blog_id: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'OAuthRequests',
  });
  return OAuthRequest;
};