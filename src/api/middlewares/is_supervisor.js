
const User = require('../models/user.model');
const httpStatus = require('http-status');

/**
 * Check if the current user is a supervisor
 * @author Jayser Mendez.
 * @public
 */
const isSupervisor = async (req, res, next) => {
  try {
    // Try to find the username in database.
    const user = await User.findOne({ username: res.locals.username });

    // If the user is found, check if the user has a supervisor role.
    if (user) {
      if (user.roles.indexOf('supervisor') > -1) {
        // Pass to the next middleware if the user is a supervisor
        return next();
      }

      // If the user is not a supervisor, return an error in the middleware
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

module.exports = isSupervisor;
