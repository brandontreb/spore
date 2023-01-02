const Joi = require('joi');

const install = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    url: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    password_again: Joi.string().required(),
  })
}

const updateBlog = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    url: Joi.string().required(),
    homepage_content: Joi.string().allow('').optional(),
    meta_description: Joi.string().allow('').optional(),
    language: Joi.string().allow('').optional(),
    nav: Joi.string().allow('').optional(),
    favicon: Joi.string().allow('').optional(),
  })
}

const createPost = {
  params: {
    id: Joi.string()
  },
  body: Joi.object().keys({
    title: Joi.string().allow('').optional(),
    slug: Joi.string().allow(null, ''),
    published_date: Joi.date().allow(null, '').optional(),
    content: Joi.string().allow(null, ''),
    meta_description: Joi.string().allow(null, '').optional(),
    meta_image_url: Joi.string().allow(null, '').optional(),
    tags: Joi.string().allow(null, '').optional(),
    is_page: Joi.boolean().default(false),
    show_in_feed: Joi.boolean().default(false),
    status: Joi.string().default('published'),    
    media_files: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
    type: Joi.string().default('post'),
  })
};

const deletePost = {
  params: {
    postId: Joi.string().required()
  }
}

module.exports = {
  install,
  updateBlog,
  createPost,
  deletePost,
}