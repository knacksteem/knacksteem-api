const express = require('express');
const postsRoutes = require('./posts.route');
const moderationRoutes = require('./moderation.route');
const statsRoutes = require('./stats.route');

const router = express.Router();

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

/**
 * KnackSteem Endpoints
 */
router.use('/posts', postsRoutes);
router.use('/moderation', moderationRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
