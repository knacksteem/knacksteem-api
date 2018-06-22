const mongoose = require('mongoose');
const { mongo, env } = require('./vars');
const User = require('../api/models/user.model');
const request = require('request-promise-native');
const config = require('./vars');

// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Exit application on error
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', true);
}

const createMasterUser = async (username) => {
  // Define the url to grab the user data
  const api = `https://api.steemjs.com/get_accounts?names[]=%5B%22${username}%22%5D`;

  // Make a http GET call to Steem API.
  const user = await request(api, { json: true });

  // Create a new user object with the required data.
  const newUser = new User({
    username,
    user,
    roles: ['supervisor', 'moderator', 'contributor'],
  });

  // Insert the new username in database.
  await User.create(newUser);
};

/**
* Connect to mongo db
*
* @returns {object} Mongoose connection
* @public
*/
exports.connect = () => {
  mongoose.connect(mongo.uri, { keepAlive: 1 }, () => {
    // Check if the user count is 0. If so, declare the master user.
    User.count((err, count) => {
      if (!err && count === 0) {
        createMasterUser(config.master_user);
      }
    });
  });
  return mongoose.connection;
};
