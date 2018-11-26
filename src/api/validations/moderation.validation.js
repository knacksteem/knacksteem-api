const Joi = require('joi');

module.exports = {
  // POST /v1/moderation/ban
  ban: {
    body: {
      username: Joi.string().required(),
      bannedUntil: Joi.number().required(),
      banReason: Joi.string().required(),
    },
  },
  // POST /v1/moderation/unban
  unban: {
    body: {
      username: Joi.string().required(),
    },
  },
  // POST /v1/moderation/moderate
  moderate: {
    body: {
      permlink: Joi.string().required(),
      approved: Joi.boolean().required(),
    },
  },
  // POST /v1/moderation/reserve
  reserve: {
    body: {
      permlink: Joi.string().required(),
    },
  },
  // POST /v1/moderation/reset
  reset: {
    body: {
      permlink: Joi.string().required(),
    },
  },
  // POST /v1/moderation/add/moderator || POST /v1/moderation/add/supervisor
  member: {
    body: {
      username: Joi.string().required(),
    },
  },
};
