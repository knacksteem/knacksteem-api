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
 * @apiParam   {String}   [author]                    Author of the post
 * @apiParam   {String}   [category]                  Category of the post
 * @apiParam   {String}   [search]                    Find posts including this text or similar text
 * @apiParam   {Number}   [limit=25]                  How many post to query
 * @apiParam   {Number}   [skip=0]                    How many post to skip in the query
 * @apiParam   {String}   [username]                  Check if this user has vote this post
 *
 * @apiSuccess {String}   title                       Title of the post
 * @apiSuccess {String}   description                 Description of the post
 * @apiSuccess {String}   category                    Category of the post
 * @apiSuccess {Array}    tags                        Tags of the post
 * @apiSuccess {Boolean}  isVoted                     Is the post voted by the provided user
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
 * @apiParam   {String}   [username]        username of the current logged in user
 *
 * @apiSuccess {String}   title             Title of the post
 * @apiSuccess {String}   description       Description of the post
 * @apiSuccess {String}   category          Category of the post
 * @apiSuccess {Boolean}  isVoted           Is the post voted by the provided user
 *
 * @apiError (NotFound 404) NotFound Permlink of the post cannot be found in the database.
 */
router.route('/:author/:permlink').get(validate(single), controller.getSinglePost);

/**
 * @api {get} v1/posts/:author/:permlink/comments Get Comments
 * @apiDescription Get comments of a post
 * @apiVersion 1.0.0
 * @apiName getPostComments
 * @apiGroup Posts
 * @apiPermission All
 *
 * @apiParam   {String}     [username]                username of the current logged in user
 *
 * @apiSuccess {Number}     status                    http status response
 * @apiSuccess {Object[]}   results                   Array with the results
 * @apiSuccess {String}     results.description       Description of the comment
 * @apiSuccess {String}     results.parent_author     Who you are replying to
 * @apiSuccess {String}     results.authorImage       Profile image of the author of the comment
 * @apiSuccess {Number}     results.postedAt          When was this comment posted
 * @apiSuccess {String}     results.url               Full URL of the comment
 * @apiSuccess {String}     results.permlink          Permlink of the comment
 * @apiSuccess {Number}     results.authorReputation  Reputation of the author
 * @apiSuccess {String}     results.author            Author of the comment
 * @apiSuccess {String}     results.category          Will be always knack-steem tag
 * @apiSuccess {Number}     results.votesCount        Votes count for this comment
 * @apiSuccess {Number}     results.totalPayout       Total payout for this comment
 * @apiSuccess {Boolean}    results.isVoted           Has the current user voted this comment
 * @apiSuccess {String}     results.repliesCount      Count the replies to this comment
 * @apiSuccess {Object[]}   results.replies           Array with the replies of this comment
 *
 * @apiError (NotFound 404) NotFound Permlink of the post cannot be found in the database.
 */
router.route('/:author/:permlink/comments').get(validate(single), controller.getComments);

module.exports = router;
