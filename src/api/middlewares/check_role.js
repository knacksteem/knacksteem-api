
const User = require('../models/user.model');
const httpStatus = require('http-status');

/**
 * Check the role of the current user
 * @author Jayser Mendez.
 * @public
 */
const checkRole = async (role, req, res, next) => {
  try {
    // Try to find the username in database.
    const user = await User.findOne({ username: res.locals.username });

    // If the user is found, check if the user indicated role.
    if (user) {
      if (user.roles.indexOf(role) > -1) {
        // Pass to the next middleware if the indicated role is present in this user.
        return next();
      }

      // If the user has not the indicated role, return an error in the middleware
      return next({
        status: httpStatus.UNAUTHORIZED,
        message: 'Unauthorized access',
      });
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

module.exports = checkRole;
