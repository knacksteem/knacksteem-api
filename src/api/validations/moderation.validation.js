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
};
