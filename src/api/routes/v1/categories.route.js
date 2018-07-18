const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/categories.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkRoleMiddleware = require('../../middlewares/check_role');
const checkUserMiddleware = require('../../middlewares/username_exists');
const { create } = require('../../validations/categories.validation');

const router = express.Router();

/**
 * @api {get} v1/categories Get Categories
 * @apiDescription Get all categories in the database
 * @apiVersion 1.0.0
 * @apiName getCategories
 * @apiGroup Categories
 * @apiPermission All
 *
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
 * @apiGroup getCategories
 * @apiPermission supervisor
 *
 * @apiHeader  {String}     access_token    SC2 User's access token
 * @apiHeader  {String}     name            Name of the category
 *
 * @apiSuccess {Number}   status            http status response
 * @apiSuccess {String}   message           http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated users can create a post
 */
router.route('/').post(validate(create), sc2Middleware, checkUserMiddleware, checkRoleMiddleware('supervisor'), controller.createCategory);

module.exports = router;
