const httpStatus = require('http-status');
const Post = require('../models/post.model');

/**
 * Check if a post is already reserved
 * @author Jayser Mendez.
 * @public
 */
const isPostReserved = async (req, res, next) => {
  try {
    // Grab the permlink from the post request
    const { permlink } = req.body;

    // Ask database if the post exist
    const post = await Post.findOne({ permlink });

    // If this post is already reserved, prevent the moderator to reserve it again.
    // If the reservation is expired, the reserved field is void.
    if (post.moderation.reserved === true && Date.now() < post.moderation.reservedUntil) {
      return next({
        status: httpStatus.UNAUTHORIZED,
        message: `This post is already reserved by ${post.moderation.reservedBy}.`,
      });
    }

    // Since the post is found and it is not reserved, pass it to the next middleware.
    res.locals.post = post;

    // If the post is not reserved, move to the next middleware.
    return next();

  // Catch any possible error.
  } catch (err) {
    // Catch errors here.
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};

module.exports = isPostReserved;
