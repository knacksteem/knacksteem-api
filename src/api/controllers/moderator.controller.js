const Post = require('../models/post.model');
const httpStatus = require('http-status');

/**
 * Method to moderate a post
 * @public
 * @author Jayser Mendez
 */
exports.moderatePost = async (req, res, next) => {
  try {
    // Grab the permlink from the post request
    const { permlink, approved } = req.body;

    // Grab the moderator username from the locals
    const moderator = res.locals.username;

    // Update the post with the new moderation data
    const post = await Post.findOneAndUpdate(
      { permlink },
      {
        'moderation.moderated': true,
        'moderation.approved': approved,
        'moderation.moderatedBy': moderator,
        'moderation.moderatedAt': +new Date(),
      },
    );

    // If the post is moderated correctly, send the message to the client.
    if (post) {
      return res.send({
        status: 200,
        message: 'Post moderated correctly',
      });
    }

    // If the post is not found, tell the client.
    return res.send({
      status: httpStatus.NOT_FOUND,
      message: 'Post not found',
    });

    // Catch any error
  } catch (err) {
    return next(err);
  }
};
