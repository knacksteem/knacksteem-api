const Joi = require('joi');

module.exports = {
  // POST /v1/categories
  create: {
    body: {
      access_token: Joi.string().min(6).max(512).required(),
      name: Joi.string().required(),
    },
  },
  // DELETE /v1/categories
  deleteCat: {
    body: {
      access_token: Joi.string().min(6).max(512).required(),
      key: Joi.string().required(),
    },
  },
  // PUT /v1/categories
  editCat: {
    body: {
      access_token: Joi.string().min(6).max(512).required(),
      key: Joi.string().required(),
      newKey: Joi.string(),
      newName: Joi.string(),
    },
  },
};
