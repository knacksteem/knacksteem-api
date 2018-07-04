const express = require('express');
const controller = require('../../controllers/stats.controller');
const validate = require('express-validation');
const { users, posts } = require('../../validations/stats.validation');

const router = express.Router();

/**
 * @api {get} v1/stats/moderation/pending Pending Posts
 * @apiDescription List and count pending posts
 * @apiVersion 1.0.0
 * @apiName pendingPosts
 * @apiGroup Stats
 * @apiPermission all
 *
 * @apiParam   {Number}  [limit=25]     How many post to query
 * @apiParam   {Number}  [skip=0]       How many post to skip in the query
 *
 * @apiSuccess {Number}     status                       http status response
 * @apiSuccess {Object[]}   results                      Array with the results
 * @apiSuccess {String}     results.title                Title of the post
 * @apiSuccess {String}     results.description          Description of the post
 * @apiSuccess {String}     results.coverImage           Cover image of the post
 * @apiSuccess {String}     results.author               Author of the post
 * @apiSuccess {Number}     results.authorReputation     Reputation of the author
 * @apiSuccess {String}     results.authorImage          Profile image of the author of the post
 * @apiSuccess {String}     results.permlink             Permlink of the post
 * @apiSuccess {Number}     results.postedAt             When was this post posted
 * @apiSuccess {String}     results.category             Category of the post
 * @apiSuccess {String[]}   results.tags                 Tags of the post
 * @apiSuccess {Number}     results.votesCount           Votes count for this post
 * @apiSuccess {Number}     results.commentsCount        Comments count for this post
 * @apiSuccess {Number}     count                        How many posts were returned
 */
router.route('/moderation/pending').get(validate(posts), controller.sendStats('moderation_pending'));

/**
 * @api {get} v1/stats/moderation/approved Approved Posts
 * @apiDescription List and count approved posts
 * @apiVersion 1.0.0
 * @apiName approvedPosts
 * @apiGroup Stats
 * @apiPermission all
 *
 * @apiParam   {String}  [username]     Username to filter posts by moderators/supervisors
 * @apiParam   {Number}  [limit=25]     How many post to query
 * @apiParam   {Number}  [skip=0]       How many post to skip in the query
 *
 * @apiSuccess {Number}     status                       http status response
 * @apiSuccess {Object[]}   results                      Array with the results
 * @apiSuccess {String}     results.title                Title of the post
 * @apiSuccess {String}     results.description          Description of the post
 * @apiSuccess {String}     results.coverImage           Cover image of the post
 * @apiSuccess {String}     results.author               Author of the post
 * @apiSuccess {Number}     results.authorReputation     Reputation of the author
 * @apiSuccess {String}     results.authorImage          Profile image of the author of the post
 * @apiSuccess {String}     results.permlink             Permlink of the post
 * @apiSuccess {Number}     results.postedAt             When was this post posted
 * @apiSuccess {String}     results.category             Category of the post
 * @apiSuccess {String[]}   results.tags                 Tags of the post
 * @apiSuccess {Number}     results.votesCount           Votes count for this post
 * @apiSuccess {Number}     results.commentsCount        Comments count for this post
 * @apiSuccess {Number}     count                        How many posts were returned
 */
router.route('/moderation/approved').get(validate(posts), controller.sendStats('moderation_approved'));

/**
 * @api {get} v1/stats/moderation/moderated Moderated Posts
 * @apiDescription List and count moderated posts
 * @apiVersion 1.0.0
 * @apiName moderatedPosts
 * @apiGroup Stats
 * @apiPermission all
 *
 * @apiParam   {String}  [username]     Username to filter posts by moderators/supervisors
 * @apiParam   {Number}  [limit=25]     How many post to query
 * @apiParam   {Number}  [skip=0]       How many post to skip in the query
 *
 * @apiSuccess {Number}     status                       http status response
 * @apiSuccess {Object[]}   results                      Array with the results
 * @apiSuccess {String}     results.title                Title of the post
 * @apiSuccess {String}     results.description          Description of the post
 * @apiSuccess {String}     results.coverImage           Cover image of the post
 * @apiSuccess {String}     results.author               Author of the post
 * @apiSuccess {Number}     results.authorReputation     Reputation of the author
 * @apiSuccess {String}     results.authorImage          Profile image of the author of the post
 * @apiSuccess {String}     results.permlink             Permlink of the post
 * @apiSuccess {Number}     results.postedAt             When was this post posted
 * @apiSuccess {String}     results.category             Category of the post
 * @apiSuccess {String[]}   results.tags                 Tags of the post
 * @apiSuccess {Number}     results.votesCount           Votes count for this post
 * @apiSuccess {Number}     results.commentsCount        Comments count for this post
 * @apiSuccess {Number}     count                        How many posts were returned
 */
router.route('/moderation/moderated').get(validate(posts), controller.sendStats('moderated'));

/**
 * @api {get} v1/stats/moderation/not-approved Not Approved Posts
 * @apiDescription List and count not approved posts
 * @apiVersion 1.0.0
 * @apiName notApprovedPosts
 * @apiGroup Stats
 * @apiPermission all
 *
 * @apiParam   {String}  [username]     Username to filter posts by moderators/supervisors
 * @apiParam   {Number}  [limit=25]     How many post to query
 * @apiParam   {Number}  [skip=0]       How many post to skip in the query
 *
 * @apiSuccess {Number}     status                       http status response
 * @apiSuccess {Object[]}   results                      Array with the results
 * @apiSuccess {String}     results.title                Title of the post
 * @apiSuccess {String}     results.description          Description of the post
 * @apiSuccess {String}     results.coverImage           Cover image of the post
 * @apiSuccess {String}     results.author               Author of the post
 * @apiSuccess {Number}     results.authorReputation     Reputation of the author
 * @apiSuccess {String}     results.authorImage          Profile image of the author of the post
 * @apiSuccess {String}     results.permlink             Permlink of the post
 * @apiSuccess {Number}     results.postedAt             When was this post posted
 * @apiSuccess {String}     results.category             Category of the post
 * @apiSuccess {String[]}   results.tags                 Tags of the post
 * @apiSuccess {Number}     results.votesCount           Votes count for this post
 * @apiSuccess {Number}     results.commentsCount        Comments count for this post
 * @apiSuccess {Number}     count                        How many posts were returned
 */
router.route('/moderation/not-approved').get(validate(posts), controller.sendStats('moderation_not_approved'));

/**
 * @api {get} v1/stats/moderation/reserved Reserved Posts
 * @apiDescription List and count reserved posts
 * @apiVersion 1.0.0
 * @apiName reservedPosts
 * @apiGroup Stats
 * @apiPermission all
 *
 * @apiParam   {String}  [username]     Username to filter posts by moderators/supervisors
 * @apiParam   {Number}  [limit=25]     How many post to query
 * @apiParam   {Number}  [skip=0]       How many post to skip in the query
 *
 * @apiSuccess {Number}     status                       http status response
 * @apiSuccess {Object[]}   results                      Array with the results
 * @apiSuccess {String}     results.title                Title of the post
 * @apiSuccess {String}     results.description          Description of the post
 * @apiSuccess {String}     results.coverImage           Cover image of the post
 * @apiSuccess {String}     results.author               Author of the post
 * @apiSuccess {Number}     results.authorReputation     Reputation of the author
 * @apiSuccess {String}     results.authorImage          Profile image of the author of the post
 * @apiSuccess {String}     results.permlink             Permlink of the post
 * @apiSuccess {Number}     results.postedAt             When was this post posted
 * @apiSuccess {String}     results.category             Category of the post
 * @apiSuccess {String[]}   results.tags                 Tags of the post
 * @apiSuccess {Number}     results.votesCount           Votes count for this post
 * @apiSuccess {Number}     results.commentsCount        Comments count for this post
 * @apiSuccess {Number}     count                        How many posts were returned
 */
router.route('/moderation/reserved').get(validate(posts), controller.sendStats('reserved'));

/**
 * @api {get} v1/stats/users All Users / 1 User
 * @apiDescription List and count all users or only a user
 * @apiVersion 1.0.0
 * @apiName allUsers
 * @apiGroup Stats
 * @apiPermission all
 *
 * @apiParam   {String}  [username]     Find a specific user by its username
 * @apiParam   {Number}  [limit=25]     How many post to query
 * @apiParam   {Number}  [skip=0]       How many post to skip in the query
 * @apiParam   {Boolean} [banned]       Banned or not banned users
 * @apiParam   {String}  [search]       Find users including this text or similar text
 *
 * @apiSuccess {Number}     status                       http status response
 * @apiSuccess {Object[]}   results                      Array with the results
 * @apiSuccess {String}     results.title                Title of the post
 * @apiSuccess {String}     results.description          Description of the post
 * @apiSuccess {String}     results.coverImage           Cover image of the post
 * @apiSuccess {String}     results.author               Author of the post
 * @apiSuccess {Number}     results.authorReputation     Reputation of the author
 * @apiSuccess {String}     results.authorImage          Profile image of the author of the post
 * @apiSuccess {String}     results.permlink             Permlink of the post
 * @apiSuccess {Number}     results.postedAt             When was this post posted
 * @apiSuccess {String}     results.category             Category of the post
 * @apiSuccess {String[]}   results.tags                 Tags of the post
 * @apiSuccess {Number}     results.votesCount           Votes count for this post
 * @apiSuccess {Number}     results.commentsCount        Comments count for this post
 * @apiSuccess {Number}     count                        How many posts were returned
 */
router.route('/users').get(validate(users), controller.allUsers);

module.exports = router;
