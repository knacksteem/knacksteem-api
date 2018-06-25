const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/moderation.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkUserMiddleware = require('../../middlewares/username_exists');
const isModeratedMiddleware = require('../../middlewares/is_moderated');
const checkRoleMiddleware = require('../../middlewares/check_role');
const { ban, moderate } = require('../../validations/moderation.validation');

const router = express.Router();

/**
 * @api {post} v1/moderation/moderate Moderate a Post
 * @apiDescription Update a post with the moderation data
 * @apiVersion 1.0.0
 * @apiName moderatePost
 * @apiGroup Moderation Tools
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
router.route('/moderate').post(
  validate(moderate),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('moderator'),
  isModeratedMiddleware,
  controller.moderatePost,
);

/**
 * @api {post} v1/moderation/ban Ban a User
 * @apiDescription Ban a user
 * @apiVersion 1.0.0
 * @apiName banUser
 * @apiGroup Moderation Tools
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
router.route('/ban').post(
  validate(ban),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('supervisor'),
  controller.banUser,
);

module.exports = router;
