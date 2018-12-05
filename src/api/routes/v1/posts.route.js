const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/posts.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkUserMiddleware = require('../../middlewares/username_exists');
const isBannedMiddleware = require('../../middlewares/is_banned');
const { create, single, update } = require('../../validations/post.validation');

const router = express.Router();

/**
 * @api {post} v1/posts/create Create Post
 * @apiDescription Insert a post into the database
 * @apiVersion 1.0.0
 * @apiName createPost
 * @apiGroup Posts
 * @apiPermission user
 *
 * @apiHeader  {String}   Authorization     SC2 User's access token
 *
 * @apiParam   {String}   permlink          Permlink of the post
 * @apiParam   {String}   category          Category of the post
 * @apiParam   {Array}    tags              Tags of the post
 *
 * @apiSuccess {Number}   status            http status response
 * @apiSuccess {String}   message           http return message
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
 * @apiParam   {String}     [author]                            Author of the post
 * @apiParam   {String}     [category]                          Category of the post
 * @apiParam   {String}     [search]                            Find posts including this text or similar text
 * @apiParam   {Number}     [limit=25]                          How many post to query
 * @apiParam   {Number}     [skip=0]                            How many post to skip in the query
 * @apiParam   {String}     [username]                          Check if this user has vote this post
 *
 * @apiSuccess {Number}     status                              http status response
 * @apiSuccess {Object[]}   results                             Array with the results
 * @apiSuccess {String}     results.title                       Title of the post
 * @apiSuccess {String}     results.description                 Description of the post
 * @apiSuccess {String}     results.coverImage                  Cover image of the post
 * @apiSuccess {String}     results.author                      Author of the post
 * @apiSuccess {Number}     results.authorReputation            Reputation of the author
 * @apiSuccess {String}     results.authorImage                 Profile image of the author of the post
 * @apiSuccess {String}     results.permlink                    Permlink of the post
 * @apiSuccess {Number}     results.postedAt                    When was this post posted
 * @apiSuccess {String}     results.category                    Category of the post
 * @apiSuccess {String[]}   results.tags                        Tags of the post
 * @apiSuccess {Object}     results.moderation                  Moderation info of the post
 * @apiSuccess {Boolean}    results.moderation.reserved         Has it been reserved
 * @apiSuccess {String}     results.moderation.reservedBy       Username reserved the post
 * @apiSuccess {Number}     results.moderation.reservedUntil    Time until post is reserved
 * @apiSuccess {Boolean}    results.moderation.moderated        Has it been moderated
 * @apiSuccess {String}     results.moderation.moderatedBy      Username moderated the post
 * @apiSuccess {Number}     results.moderation.moderatedAt      Time the post was moderated
 * @apiSuccess {Boolean}    results.moderation.approved         Has it been approved
 * @apiSuccess {Number}     results.votesCount                  Votes count for this post
 * @apiSuccess {Number}     results.commentsCount               Comments count for this post
 * @apiSuccess {Number}     count                               How many posts were returned
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
 * @apiParam   {String}     [username]                            username of the current logged in user
 *
 * @apiSuccess {Number}     status                                http status response
 * @apiSuccess {Object[]}   results                               Array with the results
 * @apiSuccess {String}     results.title                         Title of the post
 * @apiSuccess {String}     results.description                   Description of the post
 * @apiSuccess {String}     results.coverImage                    Cover image of the post
 * @apiSuccess {String}     results.author                        Author of the post
 * @apiSuccess {Number}     results.authorReputation              Reputation of the author
 * @apiSuccess {String}     results.authorImage                   Profile image of the author of the post
 * @apiSuccess {String}     results.permlink                      Permlink of the post
 * @apiSuccess {Number}     results.postedAt                      When was this post posted
 * @apiSuccess {String}     results.category                      Category of the post
 * @apiSuccess {String[]}   results.tags                          Tags of the post
 * @apiSuccess {Number}     results.votesCount                    Votes count for this post
 * @apiSuccess {Number}     results.commentsCount                 Comments count for this post
 * @apiSuccess {Object[]}   results.comments                      Array with the comments
 * @apiSuccess {String}     results.comments.description          Description of the comment
 * @apiSuccess {String}     results.comments.parentAuthor         Who you are replying to
 * @apiSuccess {String}     results.comments.authorImage          Profile image of the author of the comment
 * @apiSuccess {Number}     results.comments.postedAt             When was this comment posted
 * @apiSuccess {String}     results.comments.url                  Full URL of the comment
 * @apiSuccess {String}     results.comments.permlink             Permlink of the comment
 * @apiSuccess {Number}     results.comments.authorReputation     Reputation of the author
 * @apiSuccess {String}     results.comments.author               Author of the comment
 * @apiSuccess {String}     results.comments.category             Will be always knack-steem tag
 * @apiSuccess {Number}     results.comments.votesCount           Votes count for this comment
 * @apiSuccess {Number}     results.comments.totalPayout          Total payout for this comment
 * @apiSuccess {Boolean}    results.comments.isVoted              Has the current user voted this comment
 * @apiSuccess {String}     results.comments.repliesCount         Count the replies to this comment
 * @apiSuccess {Object[]}   results.comments.replies              Array with the replies of this comment
 * @apiSuccess {Number}     results.totalPayout                   Total payout for this post
 * @apiSuccess {Object[]}   results.activeVotes                   Array with the votes for this post
 * @apiSuccess {String}     results.activeVotes.voter             Username of the voter
 * @apiSuccess {String}     results.activeVotes.voterImage        Profile picture of the voter
 * @apiSuccess {Number}     results.activeVotes.percent           Percent of the vote
 * @apiSuccess {Number}     results.activeVotes.voterReputation   Reputation of the voter
 * @apiSuccess {Number}     results.activeVotes.voteValue         Value of the vote
 * @apiSuccess {Number}     results.activeVotes.votedAt           Date of the vote
 * @apiSuccess {Boolean}    results.isVoted                       Has the current user voted this post
 *
 * @apiError (Not Found 404) NotFound Permlink of the post cannot be found in the database.
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
 * @apiSuccess {String}     results.parentAuthor      Who you are replying to
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
 * @apiError (Not Found 404) NotFound Permlink of the post cannot be found in the database.
 */
router.route('/:author/:permlink/comments').get(validate(single), controller.getComments);

/**
 * @api {get} v1/posts/:author/:permlink/votes Get Post Votes
 * @apiDescription Get votes of a post
 * @apiVersion 1.0.0
 * @apiName getPostVotes
 * @apiGroup Posts
 * @apiPermission All
 *
 * @apiParam   {String}     [username]                Username of the current logged in user
 *
 * @apiSuccess {Number}     status                    http status response
 * @apiSuccess {Object[]}   results                   Array with the votes for this post
 * @apiSuccess {String}     results.voter             Username of the voter
 * @apiSuccess {String}     results.voterImage        Profile picture of the voter
 * @apiSuccess {Number}     results.percent           Percent of the vote
 * @apiSuccess {Number}     results.voterReputation   Reputation of the voter
 * @apiSuccess {Number}     results.voteValue         Value of the vote
 * @apiSuccess {Number}     results.votedAt           Date of the vote
 *
 * @apiError (Not Found 404) NotFound Permlink of the post cannot be found in the database.
 */
router.route('/:author/:permlink/votes').get(validate(single), controller.getVotes);

/**
 * @api {put} v1/posts/update Update tags
 * @apiDescription Update tags of a post
 * @apiVersion 1.0.0
 * @apiName updateTags
 * @apiGroup Posts
 * @apiPermission Logged users + Owners
 *
 * @apiHeader  {String}   Authorization     SC2 User's access token
 *
 * @apiParam   {String}   permlink          Permlink of the post
 * @apiParam   {Array}    tags              Tags of the post
 *
 * @apiSuccess {Number}   status            http status response
 * @apiSuccess {String}   message           http return message
 *
 * @apiError (Unauthorized 401) Unauthorized Only authenticated users can edit a post
 */
router.route('/update').put(validate(update), sc2Middleware, controller.updateTags);

module.exports = router;
