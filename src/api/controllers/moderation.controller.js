const Post = require('../models/post.model');
const httpStatus = require('http-status');
const User = require('../models/user.model');
const config = require('../../config/vars');

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
      return res.status(httpStatus.NOT_FOUND).send({
        status: httpStatus.NOT_FOUND,
        message: 'Post not found',
      });
    }

    // Check if post is reserved and reservation is not expired
    if (post.moderation.reserved === true && Date.now() < post.moderation.reservedUntil) {
      // Check if the current user is the owner of the reservation
      // If so, this user is allowed to moderate the post even if it is reserved
      if (post.moderation.reservedBy === moderator) {
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
      }
      // Otherwise, tell the client that this post is reserved by another moderator
      return res.status(httpStatus.UNAUTHORIZED).send({
        status: httpStatus.UNAUTHORIZED,
        message: `This post is already reserved by ${post.moderation.reservedBy}. You cannot moderate it by now.`,
      });
    }

    // Since the post is not reserved, a direct moderation can be done.

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
    return res.status(httpStatus.NOT_FOUND).send({
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
    return res.status(httpStatus.NOT_FOUND).send({
      status: httpStatus.NOT_FOUND,
      message: 'This posts has not been found.',
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
 * Method to reset moderation data of a post (supervisors)
 * @public
 * @author Jayser Mendez
 */
exports.resetStatus = async (req, res, next) => {
  try {
    // Grab post permlink from POST request
    const { permlink } = req.body;

    // Find the post and update it with a default moderation data
    const post = await Post.findOneAndUpdate(
      { permlink },
      {
        'moderation.moderated': false,
        'moderation.approved': false,
        'moderation.moderatedBy': null,
        'moderation.moderatedAt': null,
      },
    );

    // If the post is returned, it means that it was edited correctly. Let the client know it.
    if (post) {
      return res.send({
        status: httpStatus.OK,
        message: 'Moderation data was modified correctly.',
      });
    }

    // Otherwise, the post is not found, let the client know.
    return res.status(httpStatus.NOT_FOUND).send({
      status: httpStatus.NOT_FOUND,
      message: 'This posts has not been found.',
    });

  // Catch any error
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};

/**
 * Method to add a new member to the team
 * @public
 * @author Jayser Mendez
 */
// eslint-disable-next-line
exports.createMember = (role) => {
  return async (req, res, next) => {
    try {
      // Grab the user object from the locals
      const teamMember = res.locals.username;
      const { username } = req.body;

      // If the supervisor wants to add a new moderator, insert the respectives roles.
      if (role === 'moderator') {
        // Find/create the user
        const user = await createUser(username);

        // Update user object with new roles
        await user.update({
          $set: { roles: ['contributor', 'moderator'] },
        });

        // Let the client know that the new moderator was added correctly
        return res.send({
          status: httpStatus.OK,
          message: 'The moderator was added correctly to the team',
        });

      // If the supervisor wants to add a new supervisor, insert the respectives roles.
      } else if (role === 'supervisor') {
        // Since only the master user can add a new supervisor, check if the current user
        // is the master user. If so, allow to make a new supervisor
        if (teamMember === config.master_user) {
          // Find/create the user
          const user = await createUser(username);

          // Update user object with new roles
          await user.update({
            $set: { roles: ['contributor', 'moderator', 'supervisor'] },
          });

          // Let the client know that the new moderator was added correctly
          return res.send({
            status: httpStatus.OK,
            message: 'The supervisor was added correctly to the team',
          });
        }

        // Otherwise, reject the action
        return res.status(httpStatus.UNAUTHORIZED).send({
          status: httpStatus.UNAUTHORIZED,
          message: 'Only the master supervisor can add a new supervisor',
        });
      }

      return true;

    // Catch any error
    } catch (err) {
      return next({
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
        error: err,
      });
    }
  };
};

/**
 * Method to find or create a new user
 * @param {String} username: Username to be find or created
 * @private
 * @author Jayser Mendez
 */
const createUser = async (username, next) => {
  try {
    // Try to find the username in database.
    let user = await User.findOne({ username });

    // If the user does not exist, make it
    if (!user) {
      // Create a new user object with the required data.
      const newUser = await new User({
        username,
      });

      // Insert the new username in database.
      user = await User.create(newUser);
    }

    // Return the reference to the user object
    return user;

    // Catch any error
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};
