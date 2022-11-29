const Joi = require('joi');

const updatePhoto = {
  // body: Joi.object().keys({
  //   profile_photo: Joi.object().required(),
  // })
}

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
  })
}

module.exports = {
  updatePhoto,
  install,
  updateBlog
}