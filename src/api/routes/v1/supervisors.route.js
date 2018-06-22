const express = require('express');
const controller = require('../../controllers/supervisor.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkUserMiddleware = require('../../middlewares/username_exists');
const checkSupervisorMiddleware = require('../../middlewares/is_supervisor');

const router = express.Router();

/**
 * @api {post} v1/supervisors/ban Ban a User
 * @apiDescription Ban a user
 * @apiVersion 1.0.0
 * @apiName banUser
 * @apiGroup Supervisors
 * @apiPermission Supervisors
 *
 * @apiHeader {String}   access_token   SC2 User's access token
 *
 * @apiParam  {String}   username       User to ban
 * @apiParam  {String}   banReason      Reason of the ban
 * @apiParam  {Number}   bannedUntil    Timestamp of the ban expiration
 *
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {String}  message        http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated supervisors can ban a user.
 * @apiError (Unauthorized 404) User cannot be found in database.
 */
router.route('/ban').post(sc2Middleware, checkUserMiddleware, checkSupervisorMiddleware, controller.banUser);

module.exports = router;
