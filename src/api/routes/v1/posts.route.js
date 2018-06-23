const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/posts.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkUserMiddleware = require('../../middlewares/username_exists');
const isBannedMiddleware = require('../../middlewares/is_banned');
const { create, single } = require('../../validations/post.validation');

const router = express.Router();

/**
 * @api {post} v1/posts/create Create Post
 * @apiDescription Insert a post into the database
 * @apiVersion 1.0.0
 * @apiName createPost
 * @apiGroup Posts
 * @apiPermission user
 *
 * @apiHeader {String}   access_token      SC2 User's access token
 *
 * @apiParam  {String}   permlink          Permlink of the post
 * TODO: Add validation to the parameters.
 *
 * @apiSuccess {Number}  status            http status response
 * @apiSuccess {String}  message           http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated users can create a post
 */
router.route('/create').post(
  validate(create),
  sc2Middleware,
  checkUserMiddleware,
  isBannedMiddleware,
  controller.createPost,
);

/**
 * @api {get} v1/posts Get Posts
 * @apiDescription Get posts from database based on the given query.
 * @apiVersion 1.0.0
 * @apiName getPosts
 * @apiGroup Posts
 * @apiPermission All
 *
 * @apiParam   {String}   author            Author of the post
 * @apiParam   {String}   category          Category of the post
 * @apiParam   {String}   search            Find posts including this text or similar text
 * @apiParam   {Number}   limit             How many post to query
 * @apiParam   {Number}   skip              How many post to skip in the query
 * @apiParam   {String}   username          Check if this user has vote this post
 *
 * @apiSuccess {String}   title             Title of the post
 * @apiSuccess {String}   description       Description of the post
 * @apiSuccess {String}   category          Category of the post
 * @apiSuccess {Boolean}  isVoted           Is the post voted by the provided user
 */
router.route('/').get(controller.getPosts);

/**
 * @api {get} v1/posts/:author/:permlink Get Post Single
 * @apiDescription Get post single data
 * @apiVersion 1.0.0
 * @apiName getSinglePost
 * @apiGroup Posts
 * @apiPermission All
 *
 * @apiParam   {String}   username          username of the current logged in user
 *
 * @apiSuccess {String}   title             Title of the post
 * @apiSuccess {String}   description       Description of the post
 * @apiSuccess {String}   category          Category of the post
 * @apiSuccess {Boolean}  isVoted           Is the post voted by the provided user
 */
router.route('/:author/:permlink').get(validate(single), controller.getSinglePost);

module.exports = router;
