'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Blogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },      
      title: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      homepage_content: {
        type: Sequelize.TEXT
      },
      homepage_content_html: {
        type: Sequelize.TEXT
      },
      meta_description: {
        type: Sequelize.TEXT
      },
      nav: {
        type: Sequelize.TEXT
      },
      nav_html: {
        type: Sequelize.TEXT
      },
      language: {
        type: Sequelize.STRING
      },
      favicon: {
        type: Sequelize.STRING
      },
      meta_image_url: {
        type: Sequelize.STRING
      },
      external_stylesheet_url: {
        type: Sequelize.STRING
      },
      custom_styles: {
        type: Sequelize.TEXT
      },
      overwrite_styles: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('Blogs');
  }
};