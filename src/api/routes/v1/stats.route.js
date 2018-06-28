const express = require('express');
const controller = require('../../controllers/stats.controller');

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
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {Array}   results        Array object with pending posts
 * @apiSuccess {Number}  count          Count of the posts
 */
router.route('/moderation/pending').get(controller.sendStats('moderation_pending'));

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
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {Array}   results        Array object with pending posts
 * @apiSuccess {Number}  count          Count of the posts
 */
router.route('/moderation/approved').get(controller.sendStats('moderation_approved'));

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
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {Array}   results        Array object with pending posts
 * @apiSuccess {Number}  count          Count of the posts
 */
router.route('/moderation/moderated').get(controller.sendStats('moderated'));

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
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {Array}   results        Array object with pending posts
 * @apiSuccess {Number}  count          Count of the posts
 */
router.route('/moderation/not-approved').get(controller.sendStats('moderation_not_approved'));

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
 * @apiSuccess {Number}  status         http status of the request
 * @apiSuccess {Array}   results        Array object with pending posts
 * @apiSuccess {Number}  count          Count of the posts
 */
router.route('/moderation/reserved').get(controller.sendStats('reserved'));

module.exports = router;
