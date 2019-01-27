const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');
const logger = require('../../config/logger');

const jsonPath = path.join(__dirname, '..', '..', 'assets', 'delegations.json');
const delegators = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

/**
 * Method to insert the initial batch of delegators in the backend
 * @public
 * @author Jayser Mendez
 */
exports.seedDelegators = async () => {
  try {
    delegators.map(async (user) => {
      const delegatorUser = await User.findOne({ username: user.delegator });

      if (!delegatorUser) {
        const newUser = new User({
          username: user.delegator,
        });

        await User.create(newUser);
      }
    });
  } catch (err) {
    logger.error(err);
  }
};
