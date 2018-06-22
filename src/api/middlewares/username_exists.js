
const User = require('../models/user.model');

/**
 * Username checker. Check if username exists in database, if not, create it.
 * @author Jayser Mendez.
 * @public
 */
const userExist = async (req, res, next) => {
  try {
    // Try to find the username in database.
    const user = await User.findOne({ username: res.locals.username });

    // If the username is the same as the one from locals, pass to next middleware.
    if (user) {
      return next();
    }

    // Otherwise, user does not exist, proceed to create it.
    // Create a new user object with the required data.
    const newUser = new User({
      username: res.locals.username,
      user: res.locals.userObject,
    });

    // Insert the new username in database.
    User.create(newUser);

    // Pass to the next middleware
    return next();

  // Catch any possible error.
  } catch (err) {
    // Catch errors here.
    return next;
  }
};

module.exports = userExist;
