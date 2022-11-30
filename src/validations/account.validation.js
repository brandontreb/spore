const Joi = require('joi');

const updateAccount = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    username: Joi.string().required(),
    display_name: Joi.string().allow('').optional(),
    website: Joi.string().allow('').optional(),
    note: Joi.string().allow('').optional(),
    image_url: Joi.string().allow('').optional(),
    password: Joi.string().allow('').optional(),
    password_again: Joi.string().allow('').optional(),
  })
}

const updatePhoto = {
  // body: Joi.object().keys({
  //   avatar: Joi.object().required(),
  // })
}

module.exports = {
  updateAccount,
  updatePhoto
}