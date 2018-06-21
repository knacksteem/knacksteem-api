const express = require('express');
const controller = require('../../controllers/posts.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkUserMiddleware = require('../../middlewares/username_exists');

const router = express.Router();

/**
 * @api {post} v1/posts/create Create Post
 * @apiDescription Insert a post into the database
 * @apiVersion 1.0.0
 * @apiName createPost
 * @apiGroup Posts
 * @apiPermission user
 *
 * @apiHeader {String}   Authorization     SC2 User's access token
 *
 * @apiParam  {String}   permlink          Permlink of the post
 *
 * @apiSuccess {Number}  status            http status response
 * @apiSuccess {String}  message           http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated users can create a post
 *
 * TODO: Add validation to the parameters.
 */
router.route('/create').post(sc2Middleware, checkUserMiddleware, controller.createPost);

/**
 * @api {get} v1/posts/all Get All
 * @apiDescription Get all posts from the database
 * @apiVersion 1.0.0
 * @apiName getAllPosts
 * @apiGroup Posts
 * @apiPermission All
 *
 * @apiSuccess {String}  title             Title of the post
 * @apiSuccess {String}  description       Description of the post
 */
router.route('/all').get(controller.getAllPosts);

/**
 * @api {get} v1/posts/byAuthor Get by Author
 * @apiDescription Get all posts from a specific author from the database.
 * @apiVersion 1.0.0
 * @apiName getPostsByAuthor
 * @apiGroup Posts
 * @apiPermission All
 *
 * @apiSuccess {String}  title             Title of the post
 * @apiSuccess {String}  description       Description of the post
 */
router.route('/byAuthor').get(controller.getPostsByAuthor);

module.exports = router;
