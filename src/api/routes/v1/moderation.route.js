const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/moderation.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkUserMiddleware = require('../../middlewares/username_exists');
const isModeratedMiddleware = require('../../middlewares/is_moderated');
const checkRoleMiddleware = require('../../middlewares/check_role');
const isReservedMiddleware = require('../../middlewares/is_reserved');
const {
  ban, moderate, reserve, reset, member, unban,
} = require('../../validations/moderation.validation');

const router = express.Router();

/**
 * @api {post} v1/moderation/moderate Moderate a Post
 * @apiDescription Update a post with the moderation data
 * @apiVersion 1.0.0
 * @apiName moderatePost
 * @apiGroup Moderation Tools
 * @apiPermission moderators & supervisors
 *
 * @apiHeader {String}   Authorization  SC2 User's access token
 *
 * @apiParam  {String}   permlink       Permlink permlink of the post
 * @apiParam  {Boolean}  approved       Whether is the post approved or not
 *
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {String}  message        http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated moderators can update a post.
 * @apiError (Not Found 404) Not Found Permlink of the post cannot be found in the database.
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
 * @api {post} v1/moderation/reserve Reserve a Post
 * @apiDescription Reserve a post for moderation
 * @apiVersion 1.0.0
 * @apiName reservePost
 * @apiGroup Moderation Tools
 * @apiPermission moderators & supervisors
 *
 * @apiHeader {String}   Authorization  SC2 User's access token
 *
 * @apiParam  {String}   permlink       Permlink permlink of the post
 *
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {String}  message        http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated moderators can update a post.
 * @apiError (Not Found 404) Not Found Permlink of the post cannot be found in the database.
 */
router.route('/reserve').post(
  validate(reserve),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('moderator'),
  isReservedMiddleware,
  controller.reservePost,
);

/**
 * @api {post} v1/moderation/ban Ban an User
 * @apiDescription Ban a user
 * @apiVersion 1.0.0
 * @apiName banUser
 * @apiGroup Moderation Tools
 * @apiPermission Supervisors
 *
 * @apiHeader {String}   Authorization  SC2 User's access token
 *
 * @apiParam  {String}   username       User to ban
 * @apiParam  {String}   banReason      Reason of the ban
 * @apiParam  {Number}   bannedUntil    Timestamp of the ban expiration
 *
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {String}  message        http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated supervisors can ban a user.
 * @apiError (Not Found 404) Not Found User cannot be found in database.
 */
router.route('/ban').post(
  validate(ban),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('supervisor'),
  controller.banUser,
);

/**
 * @api {post} v1/moderation/unban Unban an User
 * @apiDescription Uban an User
 * @apiVersion 1.0.0
 * @apiName unbanUser
 * @apiGroup Moderation Tools
 * @apiPermission Supervisors
 *
 * @apiHeader {String}   Authorization  SC2 User's access token
 *
 * @apiParam  {String}   username       User to ban
 *
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {String}  message        http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated supervisors can ban a user.
 * @apiError (Not Found 404) Not Found User cannot be found in database.
 */
router.route('/unban').post(
  validate(unban),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('supervisor'),
  controller.unbanUser,
);

/**
 * @api {post} v1/moderation/reset Reset Moderation
 * @apiDescription Reset moderation data of a post to default values.
 * @apiVersion 1.0.0
 * @apiName resetModeration
 * @apiGroup Moderation Tools
 * @apiPermission Supervisors
 *
 * @apiHeader {String}   Authorization  C2 User's access token
 *
 * @apiParam  {String}   permlink       Permlink of the post
 *
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {String}  message        http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only supervisors can reset moderation data
 * @apiError (Not Found 404) Not Found Post cannot be found in database.
 */
router.route('/reset').post(
  validate(reset),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('supervisor'),
  controller.resetStatus,
);

/**
 * @api {post} v1/moderation/add/supervisor Add Supervisor
 * @apiDescription Add a new supervisor to the team.
 * @apiVersion 1.0.0
 * @apiName addSupervisor
 * @apiGroup Moderation Tools
 * @apiPermission Master Supervisors
 *
 * @apiHeader  String}   Authorization  SC2 User's access token
 *
 * @apiParam  {String}   username       Username to add as surpevisor
 *
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {String}  message        http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only master supervisors can add supervisors
 */
router.route('/add/supervisor').post(
  validate(member),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('supervisor'),
  controller.createMember('supervisor'),
);

/**
 * @api {post} v1/moderation/add/moderator Add Moderator
 * @apiDescription Add a new moderator to the team.
 * @apiVersion 1.0.0
 * @apiName addModerator
 * @apiGroup Moderation Tools
 * @apiPermission Supervisors
 *
 * @apiHeader {String}   Authorization  SC2 User's access token
 *
 * @apiParam  {String}   username       Username to add as moderator
 *
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {String}  message        http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only supervisors can add moderators
 */
router.route('/add/moderator').post(
  validate(member),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('supervisor'),
  controller.createMember('moderator'),
);

/**
 * @api {post} v1/moderation/remove/moderator Remove Supervisor
 * @apiDescription Remove a supervisor from the team.
 * @apiVersion 1.0.0
 * @apiName removeSupervisor
 * @apiGroup Moderation Tools
 * @apiPermission Master Supervisors
 *
 * @apiHeader {String}   Authorization  SC2 User's access token
 *
 * @apiParam  {String}   username       Username to remove as supervisor
 *
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {String}  message        http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only master supervisors can remove supervisor
 * @apiError (Not Found 404)    Not Found This user is not a supervisor
 */
router.route('/remove/supervisor').post(
  validate(member),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('supervisor'),
  controller.removeRole('supervisor'),
);

/**
 * @api {post} v1/moderation/remove/moderator Remove Moderator
 * @apiDescription Remove a moderator from the team.
 * @apiVersion 1.0.0
 * @apiName removeModerator
 * @apiGroup Moderation Tools
 * @apiPermission Supervisors
 *
 * @apiHeader {String}   Authorization  SC2 User's access token
 *
 * @apiParam  {String}   username       Username to remove as moderator
 *
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {String}  message        http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only supervisors can remove moderators
 * @apiError (Not Found 404)    Not Found This user is not a moderator
 */
router.route('/remove/moderator').post(
  validate(member),
  sc2Middleware,
  checkUserMiddleware,
  checkRoleMiddleware('supervisor'),
  controller.removeRole('moderator'),
);

module.exports = router;
