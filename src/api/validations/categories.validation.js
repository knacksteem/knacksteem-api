const Joi = require('joi');

module.exports = {
  // POST /v1/categories
  create: {
    body: {
      name: Joi.string().required(),
    },
  },
  // DELETE /v1/categories
  deleteCat: {
    body: {
      key: Joi.string().required(),
    },
  },
  // PUT /v1/categories
  editCat: {
    body: {
      key: Joi.string().required(),
      newKey: Joi.string(),
      newName: Joi.string(),
    },
  },
};
