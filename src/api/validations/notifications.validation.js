const Joi = require('joi');

module.exports = {
  // GET /v1/notifications
  getNotifications: {
    query: {
      limit: Joi.number().max(25),
      skip: Joi.number(),
    },
  },
};
