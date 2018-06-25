const httpStatus = require('http-status');
const Post = require('../models/post.model');

/**
 * Check if a post is already moderated
 * @author Jayser Mendez.
 * @public
 */
const isPostModerated = async (req, res, next) => {
  try {
    // Grab the permlink from the post request
    const { permlink } = req.body;

    // Ask database if this moderator has moderated this post before
    const post = await Post.findOne({ permlink });

    // If this post is already moderated, prevent the moderator to moderate it again.
    if (post.moderation.moderated === true) {
      return next({
        status: httpStatus.UNAUTHORIZED,
        message: `This post is already moderated by ${post.moderation.moderatedBy}. Contact a supervisor to change its status.`,
      });
    }

    // Expose the post object to the next middleware
    res.locals.post = post;

    // If the post is not moderated, move to the next middleware
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

module.exports = isPostModerated;
