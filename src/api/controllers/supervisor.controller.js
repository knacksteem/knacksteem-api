const User = require('../models/user.model');
const httpStatus = require('http-status');

/**
 * Method to ban a user
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
