'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uri: {
        type: Sequelize.STRING
      },
      blog_id: {
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.TEXT
      },
      text: {
        type: Sequelize.TEXT
      },
      html: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'future', 'private', 'trash')
      },
      slug: {
        type: Sequelize.STRING
      },
      permalink: {
        type: Sequelize.STRING
      },
      meta_description: {
        type: Sequelize.STRING
      },
      meta_image_url: {
        type: Sequelize.STRING
      },
      tags_csv: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      webmention_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      show_in_feed: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      published_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
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
    await queryInterface.dropTable('Posts');
  }
};