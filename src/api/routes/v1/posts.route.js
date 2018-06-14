const express = require('express');
const controller = require('../../controllers/posts.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkUserMiddleware = require('../../middlewares/username_exists');

const router = express.Router();

// TODO: Add validation to the parameters.
router.route('/create').post(sc2Middleware, checkUserMiddleware, controller.createPost);

router.route('/all').get(controller.getAllPosts);

module.exports = router;
