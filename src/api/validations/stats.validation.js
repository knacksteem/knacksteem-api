const Joi = require('joi');

module.exports = {
  // GET /v1/stats/moderation/pending
  // GET /v1/stats/moderation/approved
  // GET /v1/stats/moderation/not-approved
  // GET /v1/stats/moderation/reserved
  // GET /v1/stats/moderation/moderated
  posts: {
    query: {
      username: Joi.string(),
      author: Joi.string(),
      limit: Joi.number().max(25),
      skip: Joi.number(),
    },
  },
  // GET /v1/stats/users
  users: {
    query: {
      username: Joi.string(),
      search: Joi.string(),
      banned: Joi.boolean(),
      limit: Joi.number().max(25),
      skip: Joi.number(),
    },
  },
};
