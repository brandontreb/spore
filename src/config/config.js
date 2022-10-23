const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    BLOG_ID: Joi.string().required().description('Blog ID'),
    BLOG_URL: Joi.string().required(),
    BLOG_TITLE: Joi.string().required(),
    BLOG_DESCRIPTION: Joi.string().required(),
    USER_ID: Joi.number().required(),
    USER_NAME: Joi.string().required(),
    USER_EMAIL: Joi.string().required(),
    USER_USERNAME: Joi.string().required(),
    USER_PROFILE_PHOTO_GRAVATAR: Joi.string().required(),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(60 * 24 * 15).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_ID_EXPIRATION_MINUTES: Joi.number().default(5).description('minutes after which id tokens expire'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  blog: {
    id: envVars.BLOG_ID,
    url: envVars.BLOG_URL,
    user: {
      id: envVars.USER_ID,
      name: envVars.USER_NAME,
      email: envVars.USER_EMAIL,
      username: envVars.USER_USERNAME,
      profile_photo_gravatar: envVars.USER_PROFILE_PHOTO_GRAVATAR,
    }
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    idExpirationMinutes: envVars.JWT_ID_EXPIRATION_MINUTES,
  },
};