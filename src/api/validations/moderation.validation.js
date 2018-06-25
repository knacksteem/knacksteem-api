const Joi = require('joi');

module.exports = {
  // POST /v1/moderation/ban
  ban: {
    body: {
      access_token: Joi.string().min(6).max(512).required(),
      username: Joi.string().required(),
      bannedUntil: Joi.number().required(),
      banReason: Joi.string().required(),
    },
  },
  // POST /v1/moderation/moderate
  moderate: {
    body: {
      access_token: Joi.string().min(6).max(512).required(),
      permlink: Joi.string().required(),
      approved: Joi.boolean().required(),
    },
  },
  // POST /v1/moderation/reserve
  reserve: {
    body: {
      access_token: Joi.string().min(6).max(512).required(),
      permlink: Joi.string().required(),
    },
  },
};
