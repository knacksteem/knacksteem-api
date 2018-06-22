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
 * @apiParam  {String}   permlink       Permlink permlink of the post
 * @apiParam  {Boolean}  approved       Whether is the post approved or not
 *
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {String}  message        http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated moderators can update a post.
 * @apiError (Unauthorized 404) Permlink of the post cannot be found in the database.
 */
router.route('/ban').post(sc2Middleware, checkUserMiddleware, checkSupervisorMiddleware, controller.banUser);

module.exports = router;
