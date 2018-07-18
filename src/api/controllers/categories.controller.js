const Category = require('../models/category.model');
const httpStatus = require('http-status');

/**
 * Get all the categories in database
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categoriesList = await Category.find({}, { __v: 0, _id: 0 });

    return res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      results: categoriesList,
      count: categoriesList.length,
    });
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};

/**
 * Create a new category in database
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    // Strip all the empty spaces and special characters and convert to lower case
    const key = name.replace(/[^A-Z0-9]+/ig, '').toLowerCase();

    const newCategory = await new Category({ key, name });

    await Category.create(newCategory);

    return res.status(httpStatus.CREATED).send({
      status: httpStatus.CREATED,
      message: 'Category was correctly created',
    });
  } catch (err) {
    // Return exact error if there is a collision in the key
    if (err.message.includes('E11000')) {
      return next({
        status: httpStatus.NOT_ACCEPTABLE,
        message: 'Opps! A category with this name already exists.',
        error: err,
      });
    }
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};
