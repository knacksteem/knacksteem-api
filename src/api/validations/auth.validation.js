const Joi = require('joi');

module.exports = {
  // POST /v1/auth/register
  register: {
    body: {
      username: Joi.string().max(16).required(),
      sc2token: Joi.string().required().min(6).max(128),
    },
  },

  // POST /v1/auth/login
  login: {
    body: {
      username: Joi.string().max(16).required(),
      sc2token: Joi.string().required().max(128),
    },
  },

  // POST /v1/auth/refresh
  refresh: {
    body: {
      username: Joi.string().max(16).required(),
      refreshToken: Joi.string().required(),
    },
  },
};
