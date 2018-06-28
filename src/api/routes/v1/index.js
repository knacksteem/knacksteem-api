const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const postsRoutes = require('./posts.route');
const moderationRoutes = require('./moderation.route');
const statsRoutes = require('./stats.route');


const router = express.Router();

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/moderation', moderationRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
