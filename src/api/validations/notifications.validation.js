const Joi = require('joi');

module.exports = {
  // GET /v1/notifications
  getNotifications: {
    query: {
      limit: Joi.number().max(25),
      skip: Joi.number(),
    },
  },
  // PUT /v1/notifications
  readNotification: {
    body: {
      id: Joi.string().required(),
    },
  },
};
