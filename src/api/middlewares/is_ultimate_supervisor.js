const httpStatus = require('http-status');
const config = require('../../config/vars');

/**
 * Check if the current user is the ultimate supervisor.
 * @author Jayser Mendez.
 * @public
 */
const isUltimateSupervisor = async (req, res, next) => {
  try {
    // Grab the user object from the checkUser middleware.
    const { user } = res.locals;

    if (user) {
      // If the current user is the master user, proceed.
      if (user.username === config.master_user) {
        return next();
      }

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

module.exports = isUltimateSupervisor;
