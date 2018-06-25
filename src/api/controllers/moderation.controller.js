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
    const { approved } = req.body;

    // Grab the moderator username from the locals
    const moderator = res.locals.username;

    // Grab the post from the locals
    const { post } = res.locals;

    // If the post is not found, tell the client.
    if (!post) {
      return res.send({
        status: httpStatus.NOT_FOUND,
        message: 'Post not found',
      });
    }

    // Update the post with the moderation data
    await post.update({
      'moderation.moderated': true,
      'moderation.approved': approved,
      'moderation.moderatedBy': moderator,
      'moderation.moderatedAt': +new Date(),
    });

    // If the post is moderated correctly, send the message to the client.
    return res.send({
      status: 200,
      message: 'Post moderated correctly',
    });

    // Catch any error
  } catch (err) {
    // Catch errors here.
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
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
    // Catch errors here.
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};

/**
 * Method to reserve a post for moderation.
 * @public
 * @author Jayser Mendez
 */
exports.reservePost = async (req, res, next) => {
  try {
    // Get the moderator username from the last middleware.
    const moderator = res.locals.username;

    // Grab the post from the locals
    const { post } = res.locals;

    // Set a temp date with the current date
    const d1 = new Date();
    // Initialize another new date
    const reservedUntil = new Date(d1);
    // Add one hour to the second date using the first date.
    reservedUntil.setHours(d1.getHours() + 1);

    // Update the post with the reservation data
    await post.update({
      'moderation.reserved': true, // Can be voided if the reservedUntil is expired
      'moderation.reservedBy': moderator,
      'moderation.reservedUntil': reservedUntil, // Only 1 hour
    });

    // If the post is returned, it means that it was edited correctly. Let the client know it.
    if (post) {
      return res.send({
        status: httpStatus.OK,
        message: 'Post reserved correctly.',
      });
    }

    // Otherwise, the post is not found, let the client know.
    return res.send({
      status: httpStatus.NOT_FOUND,
      message: 'This posts has not been found.',
    });
  } catch (err) {
    // Catch errors here.
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};
