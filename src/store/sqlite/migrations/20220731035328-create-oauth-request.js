'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OAuthRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      client_id: {
        type: Sequelize.STRING
      },
      response_type: {
        type: Sequelize.STRING
      },
      redirect_uri: {
        type: Sequelize.STRING
      },
      scope: {
        type: Sequelize.STRING
      },
      code_challenge: {
        type: Sequelize.STRING
      },
      code_challenge_method: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      blog_id: {
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING
      },
      grant_type: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OAuthRequests');
  }
};