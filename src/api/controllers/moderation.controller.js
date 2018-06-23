const Post = require('../models/post.model');
const httpStatus = require('http-status');
const User = require('../models/user.model');

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

/**
 * Method to ban a user (Only for supervisors)
 * @public
 * @author Jayser Mendez
 */
exports.banUser = async (req, res, next) => {
  try {
    // Grab the user data and ban data from body
    const { username, bannedUntil, banReason } = req.body;

    // Grab the supervisor username from the locals
    const supervisor = res.locals.username;

    // Update the post with the new ban data
    const user = await User.findOneAndUpdate(
      { username },
      {
        isBanned: true,
        bannedBy: supervisor,
        banReason,
        bannedUntil,
      },
    );

    // If the user was banned correctly, send the message to the client.
    if (user) {
      return res.send({
        status: 200,
        message: 'User was banned correctly.',
      });
    }

    // If the user is not found, tell the client.
    return res.send({
      status: httpStatus.NOT_FOUND,
      message: 'User is not found.',
    });

    // Catch any error
  } catch (err) {
    return next(err);
  }
};
