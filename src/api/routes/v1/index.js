const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const postsRoutes = require('./posts.route');
const moderationRoutes = require('./moderation.route');
const supervisorRoutes = require('./supervisors.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/moderation', moderationRoutes);
router.use('/supervisors', supervisorRoutes);

module.exports = router;
