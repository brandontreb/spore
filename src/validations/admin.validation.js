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
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().allow('').optional(),
    password_again: Joi.string().allow('').optional(),
    about: Joi.string().allow('').optional(),
    name: Joi.string().allow('').optional(),
    website: Joi.string().allow('').optional(),
  })
}

module.exports = {
  updatePhoto,
  install,
  updateBlog
}