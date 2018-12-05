const Joi = require('joi');

module.exports = {
  // POST /v1/posts/create
  create: {
    body: {
      permlink: Joi.string().required(),
      category: Joi.string().required().max(25),
    },
  },
  // PUT /v1/posts/update
  update: {
    body: {
      permlink: Joi.string().required(),
      tags: Joi.array().required(),
    },
  },
  // GET /v1/posts/:author/:permlink
  single: {
    param: {
      author: Joi.string().required(),
      permlink: Joi.string().required(),
    },
    query: {
      username: Joi.string(),
      limit: Joi.number().max(25),
      skip: Joi.number(),
      search: Joi.string(),
    },
  },
};
