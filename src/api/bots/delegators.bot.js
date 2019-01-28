/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
const logger = require('../../config/logger');
const fs = require('fs');
const path = require('path');
const utils = require('./utils.bot');
const config = require('../../config/vars');

/**
 * Starts delegators token distribution.
 * @param {node-schedule} schedule: node-schedule object
 * @public
 * @author Jayser Mendez
 */
exports.startTokenDistribution = async (schedule) => {
  try {
    // Sync delegators
    await utils.delegatorsSync();

    // Wait for three seconds to reflect new changes
    await utils.sleep(3000);

    // Open delegators file
    const jsonPath = path.join(__dirname, '..', '..', 'assets', 'delegations.json');
    const delegators = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Re-sync delegators into database
    await utils.reSeedDelegators(delegators);

    const steemDelegations = [];
    let totalDelegated = 0;

    // Map the delegations and get the total delegations
    for (const user of delegators) {
      const delegatedVp = await utils.vestToSteem(user.vesting_shares);
      totalDelegated += delegatedVp;
      steemDelegations.push({
        user: user.delegator,
        delegation: delegatedVp,
      });
    }

    // distrubte tokens
    for (const delegator of steemDelegations) {
      const kntRewards = (delegator.delegation * config.maxKNTDaily) / totalDelegated;

      await utils.addKntToDelegator(delegator.user, kntRewards);
    }
  } catch (err) {
    logger.error(err);
  }
};

