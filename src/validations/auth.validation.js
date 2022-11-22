const Joi = require('joi');

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
    remember: Joi.boolean().optional().default(true),
  }),
};

module.exports = {
  login,
};