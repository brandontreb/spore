const Joi = require('joi');

const updateAccount = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    username: Joi.string().required(),
    full_name: Joi.string().allow('').optional(),
    website: Joi.string().allow('').optional(),
    about: Joi.string().allow('').optional(),
    image_url: Joi.string().allow('').optional(),
    password: Joi.string().allow('').optional(),
    password_again: Joi.string().allow('').optional(),
  })
}

const updatePhoto = {
  // body: Joi.object().keys({
  //   profile_photo: Joi.object().required(),
  // })
}

module.exports = {
  updateAccount,
  updatePhoto
}