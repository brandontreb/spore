'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Media', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      post_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Posts',
          key: 'id'
        }
      },
      alt_text: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      original_filename: {
        type: Sequelize.STRING
      },
      path: {
        type: Sequelize.STRING
      },
      mime_type: {
        type: Sequelize.STRING
      },
      filename: {
        type: Sequelize.STRING
      },
      size: {
        type: Sequelize.INTEGER
      },
      url: {
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
    await queryInterface.dropTable('Media');
  }
};