const Joi = require('joi');

module.exports = {
  // POST /v1/posts/create
  create: {
    body: {
      access_token: Joi.string().min(6).max(512).required(),
      permlink: Joi.string().required(),
      category: Joi.string().required().max(25),
    },
  },

  // GET /v1/posts/:author/:permlink
  single: {
    params: {
      author: Joi.string().required(),
      permlink: Joi.string().required(),
      username: Joi.string(),
    },
  },
};
