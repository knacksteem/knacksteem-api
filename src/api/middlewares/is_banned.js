const httpStatus = require('http-status');

/**
 * Check if the current user is banned
 * @author Jayser Mendez.
 * @public
 */
const isBanned = async (req, res, next) => {
  try {
    // Try to find the username in database.
    const { user } = res.locals;

    // If the user is found, check if the user is banned and ban is not expired
    if (user) {
      if (user.isBanned === true && new Date(user.bannedUntil).getTime() < Date.now()) {
        // Deny access if the user is banned
        return next({
          status: httpStatus.UNAUTHORIZED,
          message: 'Unauthorized access. You have been banned!',
          reason: user.banReason,
          expiration: new Date(user.bannedUntil).toLocaleDateString('en-US'),
          bannedBy: user.bannedBy,
        });
      }

      // If the user is not banned, move to the next middleware
      return next();
    }

    // If not user is found, let the client know that this user does not exist
    return next({
      status: httpStatus.UNAUTHORIZED,
      message: 'This username does not exist in our records. Unauthorized access.',
    });

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

module.exports = isBanned;
