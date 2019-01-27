const Post = require('../models/post.model');
const httpStatus = require('http-status');
const User = require('../models/user.model');
const config = require('../../config/vars');
const helper = require('../utils/Helper');
const BotQueue = require('../models/queue.model');
const logger = require('../../config/logger');
const Category = require('../models/category.model');

/**
 * Method to find or create a new user
 * @param {String} username: Username to be find or created
 * @param {Function} next: Express.js middleware callback
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

/**
 * Insert post into the bot queue.
 * @param {Object} post: Post object.
 * @param {number} score: Moderation score.
 * @private
 * @author Jayser Mendez
 */
const createQueuePost = async (post, score) => {
  try {
    const category = await Category.findOne({ name: post.category });
    const weight = (score * category.scoreCap) / 100;

    const queuePost = new BotQueue({
      permalink: post.permlink,
      author: post.author,
      weight,
    });

    await BotQueue.create(queuePost);
  } catch (err) {
    logger.error(err);
  }
};

/**
 * Method to moderate a post
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.moderatePost = async (req, res, next) => {
  try {
    // Grab the permlink from the post request
    const { approved, score } = req.body;

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

    // Generate metadata of the notification
    const metadata = {
      permlink: post.permlink,
      category: post.category,
      author: post.author,
    };

    // Retrieve back socketio instanace
    const io = req.app.get('socketio');

    // Decide the type of the notification
    const notificationType = approved === true || approved === 'true' ? 'POST_APPROVED' : 'POST_NOT_APPROVED';

    // Create and insert the notification in database
    const notification = await helper.generateNotification(notificationType, post.author, metadata);

    // Check if post is reserved and reservation is not expired
    if (post.moderation.reserved === true && Date.now() < post.moderation.reservedUntil) {
      // Check if the current user is the owner of the reservation
      // If so, this user is allowed to moderate the post even if it is reserved
      if (post.moderation.reservedBy === moderator) {
        // Update the post with the moderation data
        await post.updateOne({
          'moderation.moderated': true,
          'moderation.approved': approved,
          'moderation.moderatedBy': moderator,
          'moderation.moderatedAt': +new Date(),
          'moderation.reserved': false,
          'moderation.score': score || 0,
        });

        // Deliver notification to client side.
        io.in(post.author).emit('notification', notification);

        // If the moderation is approved, add the post to the queue
        if (approved === true) createQueuePost(post, score);

        // If the post is moderated correctly, send the message to the client.
        return res.status(httpStatus.OK).send({
          status: httpStatus.OK,
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
    await post.updateOne({
      'moderation.moderated': true,
      'moderation.approved': approved,
      'moderation.moderatedBy': moderator,
      'moderation.moderatedAt': +new Date(),
      'moderation.score': score || 0,
    });

    // If the moderation is approved, add the post to the queue
    if (approved === true) createQueuePost(post, score);

    // Deliver notification to client side.
    io.in(post.author).emit('notification', notification);

    // If the post is moderated correctly, send the message to the client.
    return res.status(httpStatus.OK).send({
      status: httpStatus.OK,
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
 * Method to unban a user (Only for supervisors)
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.unbanUser = async (req, res, next) => {
  try {
    const { username } = req.body;

    const user = await User.findOneAndUpdate(
      { username },
      {
        isBanned: false,
        bannedBy: null,
        banReason: null,
        bannedUntil: null,
      },
    );

    if (user) {
      // Retrieve back socketio instanace
      const io = req.app.get('socketio');

      // Create and insert the notification in database
      const notification = await helper.generateNotification('UNBAN', username);

      // Deliver notification to client side.
      io.in(username).emit('notification', notification);

      return res.status(httpStatus.OK).send({
        status: httpStatus.OK,
        message: 'User was unbanned correctly.',
      });
    }

    return res.status(httpStatus.NOT_FOUND).send({
      status: httpStatus.NOT_FOUND,
      message: 'User is not found.',
    });
  } catch (err) {
    return next({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Opps! Something is wrong in our server. Please report it to the administrator.',
      error: err,
    });
  }
};

/**
 * Method to ban a user (Only for supervisors)
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.banUser = async (req, res, next) => {
  try {
    // Grab the user data and ban data from body
    const { username, bannedUntil, banReason } = req.body;

    // Grab the supervisor username from the locals
    const supervisor = res.locals.username;

    const metadata = {
      isBanned: true,
      bannedBy: supervisor,
      banReason,
      bannedUntil,
    };

    // Update the post with the new ban data
    const user = await User.findOneAndUpdate(
      { username },
      metadata,
    );

    // If the user was banned correctly, send the message to the client.
    if (user) {
      // Retrieve back socketio instanace
      const io = req.app.get('socketio');

      // Create and insert the notification in database
      const notification = await helper.generateNotification('BAN', username, metadata);

      // Deliver notification to client side.
      io.in(username).emit('notification', notification);

      return res.status(httpStatus.OK).send({
        status: httpStatus.OK,
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
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
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
    await post.updateOne({
      'moderation.reserved': true, // Can be voided if the reservedUntil is expired
      'moderation.reservedBy': moderator,
      'moderation.reservedUntil': reservedUntil, // Only 1 hour
      'moderation.moderated': false, // In case in was reserved after it was moderated
      'moderation.approved': false, // In case in was reserved after it was approved
    });

    // If the post is returned, it means that it was edited correctly. Let the client know it.
    if (post) {
      return res.status(httpStatus.OK).send({
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
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
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

    // remove the post from the queue
    await BotQueue.findOneAndRemove({ permalink: permlink });

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
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @public
 * @author Jayser Mendez
 */
exports.createMember = role => async (req, res, next) => {
  try {
    // Grab the user object from the locals
    const teamMember = res.locals.username;

    // Grab the username from the POST body
    const { username } = req.body;

    // If the supervisor wants to add a new moderator, insert the respectives roles.
    if (role === 'moderator') {
      // Find/create the user
      const user = await createUser(username);

      // Update user object with new roles
      await user.updateOne({
        $set: { roles: ['contributor', 'moderator'] },
      });

      // Let the client know that the new moderator was added correctly
      return res.status(httpStatus.OK).send({
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
        await user.updateOne({
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

/**
 * Method to remove role from a user
 * @param {Object} req: url params
 * @param {Function} res: Express.js response callback
 * @param {Function} next: Express.js middleware callback
 * @param {String} role: Role to remove
 * @public
 * @author Jayser Mendez
 */
exports.removeRole = role => async (req, res, next) => {
  try {
    // Grab the user object from the locals
    const teamMember = res.locals.username;

    // Grab the username from the POST body
    const { username } = req.body;

    // First find the username and then check if this user is a supervisor
    const user = await User.findOne({ username });

    // If there is not user, stop the request and let the client know
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).send({
        status: httpStatus.NOT_FOUND,
        message: 'This user cannot be found in our records',
      });
    }

    // Check if the team member wants to remove a supervisor
    if (role === 'supervisor') {
      // Check if the user provided is another supervisor and check if the team member
      // is not the master supervisor
      if (user.roles.indexOf('supervisor') > -1 && teamMember !== config.master_user) {
        // If so, tell the client that this user is not authorized to perform such action
        return next({
          status: httpStatus.UNAUTHORIZED,
          message: 'Only the master supervisor can remove another supervisor.',
        });

      // Check if the user provided is a supervisor and the team member is a master supervisor
      } else if (user.roles.indexOf('supervisor') > -1 && teamMember === config.master_user) {
        // Otherwise, the master supervisor is doing it, proceed.
        await user.updateOne({
          $pull: { roles: 'supervisor' },
        });

        return res.status(httpStatus.OK).send({
          status: httpStatus.OK,
          message: 'Supervisor role correctly removed',
        });
      }

      // Otherwise, this user is not a supervisor, let the client know
      return res.status(httpStatus.NOT_FOUND).send({
        status: httpStatus.NOT_FOUND,
        message: 'The user provided is not a supervisor',
      });

    // Check if the team member wants to remove a moderator
    } else if (role === 'moderator') {
      // Check if the user is currently a moderator
      if (user.roles.indexOf('moderator') > -1) {
        // Pull the moderator role from this user
        await user.updateOne({
          $pull: { roles: 'moderator' },
        });

        return res.status(httpStatus.OK).send({
          status: httpStatus.OK,
          message: 'Moderator role correctly removed',
        });
      }

      // Otherwise, this user is not a moderator, let the client know
      return res.status(httpStatus.NOT_FOUND).send({
        status: httpStatus.NOT_FOUND,
        message: 'The user provided is not a moderator',
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
