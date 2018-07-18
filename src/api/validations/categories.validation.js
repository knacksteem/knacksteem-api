const Joi = require('joi');

module.exports = {
  // POST /v1/categories
  create: {
    body: {
      access_token: Joi.string().min(6).max(512).required(),
      name: Joi.string().required(),
    },
  },
};
