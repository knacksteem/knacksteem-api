const Post = require('../models/post.model');
const ModeratedPost = require('../models/moderated.model');
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

    // Ask database if this moderator has moderated this post before
    const isModerated = await ModeratedPost.findOne({ permlink, moderatedBy: moderator });

    // If this post is already moderated, prevent the moderator to moderate it again.
    if (isModerated) {
      return res.send({
        status: httpStatus.UNAUTHORIZED,
        message: 'You\'ve already moderated this post. Contact a supervisor to change its status.',
      });
    }

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

    // Create a new moderated post with the data above.
    const moderation = new ModeratedPost({
      moderated: true,
      approved,
      moderatedBy: moderator,
      moderatedAt: +new Date(),
      permlink,
      category: post.category,
    });

    // Insert the new moderated post into its respective collection.
    const moderatedPost = await ModeratedPost.create(moderation);

    // If the post is moderated correctly, send the message to the client.
    if (post && moderatedPost) {
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
