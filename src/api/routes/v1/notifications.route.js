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
 * @apiHeader  {String}     Authorization                SC2 User's access token
 *
 * @apiParam   {Number}     [limit=25]                   How many post to query
 * @apiParam   {Number}     [skip=0]                     How many post to skip in the query
 *
 * @apiSuccess {Number}     status                       http status response
 * @apiSuccess {Object[]}   results                      Array with the notifications
 * @apiSuccess {String}     results.type                 Type of the notification
 * @apiSuccess {String}     results.to                   Recipient of the notification
 * @apiSuccess {Bool}       results.read                 Notification read flag
 * @apiSuccess {Bool}       results.metadata             Notification's metadata
 * @apiSuccess {Number}     count                        How many notifications were returned
 */
router.route('/').get(validate(getNotifications), sc2Middleware, checkUserMiddleware, controller.getNotifications);
