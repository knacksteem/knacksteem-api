const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/notifications.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkUserMiddleware = require('../../middlewares/username_exists');
const { getNotifications } = require('../../validations/notifications.validation');

const router = express.Router();

/**
 * @api {get} v1/notifications Get Notifications
 * @apiDescription Get notifications belonging to an user
 * @apiVersion 1.0.0
 * @apiName getNotifications
 * @apiGroup Notifications
 * @apiPermission Logged in user
 *
 * @apiSuccess {Number}     status                       http status response
 * @apiSuccess {Object[]}   results                      Array with the notifications
 * @apiSuccess {String}     results.key                  Key of the category
 * @apiSuccess {String}     results.name                 Name of the category
 * @apiSuccess {Number}     count                        How many categories were returned
 */
router.route('/').get(validate(getNotifications), sc2Middleware, checkUserMiddleware, controller.getNotifications);
