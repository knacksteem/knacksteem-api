const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/categories.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkRoleMiddleware = require('../../middlewares/check_role');
const checkUserMiddleware = require('../../middlewares/username_exists');
const isUltimateSupervisor = require('../../middlewares/is_ultimate_supervisor');
const { create, deleteCat, editCat } = require('../../validations/categories.validation');

const router = express.Router();

/**
 * @api {get} v1/categories Get Categories
 * @apiDescription Get all categories in the database
 * @apiVersion 1.0.0
 * @apiName getCategories
 * @apiGroup Categories
 * @apiPermission All
 *
 * @apiSuccess {Number}     status                       http status response
 * @apiSuccess {Object[]}   results                      Array with the results
 * @apiSuccess {String}     results.key                  Key of the category
 * @apiSuccess {String}     results.name                 Name of the category
 * @apiSuccess {Number}     count                        How many categories were returned
 */
router.route('/').get(controller.getCategories);

/**
 * @api {post} v1/categories Create Category
 * @apiDescription Insert a category into the database
 * @apiVersion 1.0.0
 * @apiName createCategory
 * @apiGroup Categories
 * @apiPermission supervisor
 *
 * @apiHeader  {String}   Authorization     SC2 User's access token
 *
 * @apiParam   {String}   name              Name of the category
 *
 * @apiSuccess {Number}   status            http status response
 * @apiSuccess {String}   message           http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated users can create a category.
 */
router.route('/').post(validate(create), sc2Middleware, checkUserMiddleware, checkRoleMiddleware('supervisor'), controller.createCategory);

/**
 * @api {delete} v1/categories Delete Category
 * @apiDescription Delete a category from the database
 * @apiVersion 1.0.0
 * @apiName deleteCategory
 * @apiGroup Categories
 * @apiPermission Ultimate Supervisor
 *
 * @apiHeader  {String}   Authorization     SC2 User's access token
 *
 * @apiParam   {String}   key               Key of the category
 *
 * @apiSuccess {Number}   status            http status response
 * @apiSuccess {String}   message           http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated master supervisors can delete a category.
 * @apiError (Not Found 404) Not Found Key of the category cannot be found in database.
 */
router.route('/').delete(
  validate(deleteCat),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('supervisor'),
  isUltimateSupervisor,
  controller.deleteCategory,
);

/**
 * @api {put} v1/categories Edit Category
 * @apiDescription Edit a category from the database
 * @apiVersion 1.0.0
 * @apiName editCategory
 * @apiGroup Categories
 * @apiPermission Ultimate Supervisor
 *
 * @apiHeader  {String}   Authorization     SC2 User's access token
 *
 * @apiParam   {String}   key               Key of the category
 * @apiParam   {String}   newKey            New key of the category
 * @apiParam   {String}   newName           New name of the category
 *
 * @apiSuccess {Number}   status            http status response
 * @apiSuccess {String}   message           http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated master supervisors can edit a category.
 * @apiError (Not Found 404) Not Found Key of the category cannot be found in database.
 */
router.route('/').put(
  validate(editCat),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('supervisor'),
  isUltimateSupervisor,
  controller.editCategory,
);

module.exports = router;
