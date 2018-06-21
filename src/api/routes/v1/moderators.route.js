const express = require('express');
const controller = require('../../controllers/moderator.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkUserMiddleware = require('../../middlewares/username_exists');
const checkModeratorMiddleware = require('../../middlewares/is_moderator');

const router = express.Router();

/**
 * @api {post} v1/moderators/moderate Moderate a Post
 * @apiDescription Update a post with the moderation data
 * @apiVersion 1.0.0
 * @apiName moderatePost
 * @apiGroup Moderators/Supervisors
 * @apiPermission moderators & supervisors
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
router.route('/moderate').post(sc2Middleware, checkUserMiddleware, checkModeratorMiddleware, controller.moderatePost);

module.exports = router;
