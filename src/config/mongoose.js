const mongoose = require('mongoose');
const { mongo, env } = require('./vars');
const User = require('../api/models/user.model');
const config = require('./vars');
const seed = require('../api/seed/');
const logger = require('./../config/logger');

// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', true);
}

/**
 * Method to insert the master user in the database.
 * @param {String} username: Username of the master user
 * @private
 * @author Jayser Mendez.
 */
const createMasterUser = async (username) => {
  try {
    // Create a new user object with the required data.
    const newUser = new User({
      username,
      roles: ['supervisor', 'moderator', 'contributor'],
    });

    // Insert the new username in database.
    return await User.create(newUser);

  // Return just false if any error
  } catch (err) {
    return false;
  }
};

/**
  * Connect to mongo db
  *
  * @returns {object} Mongoose connection
  * @public
  */
exports.connect = async () => {
  mongoose.connect(mongo.uri, { keepAlive: 1, useNewUrlParser: true }, async () => {
    // Check if the user count is 0. If so, declare the master user.
    User.countDocuments((err, count) => {
      if (!err && count === 0) {
        createMasterUser(config.master_user);
      }
    });

    // Insert the initial batch of categories into the database.
    await seed.categoriesSeed.seedCategories();

    // Insert the initial batch of delegators into the database.
    await seed.delegatorsSeed.seedDelegators();
  });
  return mongoose.connection;
};
