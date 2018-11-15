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

/**
 * Modifies a category in database
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.editCategory = async (req, res, next) => {
  try {
    const { key, newKey, newName } = req.body;

    // eslint-disable-next-line
    let query = {};

    if (newKey) {
      query.key = newKey;
    }

    if (newName) {
      query.name = newName;
    }

    const category = await Category.findOneAndUpdate(
      { key },
      { $set: query },
    );

    if (category) {
      return res.status(httpStatus.OK).send({
        status: httpStatus.OK,
        message: 'Category was correctly modified.',
      });
    }

    return res.status(httpStatus.NOT_FOUND).send({
      status: httpStatus.NOT_FOUND,
      message: 'Category is not found.',
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
 * Deletes a category in database
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { key } = req.body;

    const category = await Category.findOneAndDelete({ key });

    if (category) {
      return res.status(httpStatus.OK).send({
        status: httpStatus.OK,
        message: 'Category was correctly deleted.',
      });
    }

    return res.status(httpStatus.NOT_FOUND).send({
      status: httpStatus.NOT_FOUND,
      message: 'Category is not found.',
    });
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};
