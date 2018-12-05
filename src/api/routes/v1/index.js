const express = require('express');
const postsRoutes = require('./posts.route');
const moderationRoutes = require('./moderation.route');
const statsRoutes = require('./stats.route');
const categoriesRoutes = require('./categories.route');
const notificationsRoutes = require('./notifications.route');

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
router.use('/categories', categoriesRoutes);
router.use('/notifications', notificationsRoutes);

module.exports = router;
