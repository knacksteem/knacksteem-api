const httpStatus = require('http-status');

/**
 * Check if the current user is banned
 * @author Jayser Mendez.
 * @public
 */
const isBanned = async (req, res, next) => {
  try {
    // grab the user object from the last middleware which was store in the locals.
    const { user } = res.locals;

    // If the user is found, check if the user is banned and ban is not expired
    if (user) {
      if (user.isBanned === true && Date.now() < user.bannedUntil) {
        // Deny access if the user is banned
        return next({
          status: httpStatus.UNAUTHORIZED,
          message: 'Unauthorized access. You have been banned!',
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
