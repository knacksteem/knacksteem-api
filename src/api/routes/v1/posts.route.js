const express = require('express');
const controller = require('../../controllers/posts.controller');
const sc2Middleware = require('../../middlewares/sc2');
const checkUserMiddleware = require('../../middlewares/username_exists');

const router = express.Router();

router.route('/create').post(sc2Middleware, checkUserMiddleware, controller.createPost);

module.exports = router;
