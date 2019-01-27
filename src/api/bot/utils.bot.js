/* eslint-disable no-mixed-operators */
const axios = require('axios');
const logger = require('../../config/logger');
const config = require('../../config/vars');
const scheduler = require('./scheduler.bot');
const moment = require('moment');
const User = require('../models/user.model');

/**
 * https://github.com/actifit/actifit-bot/blob/5d09169020f36a03c63219ba14680839088f00fb/utils.js#L60
 * Calculates the current voting power (in percentage) of the given account.
 * @param {object} account: Account object.
 * @returns A float representing the current voting power percentage.
 * @public
 */
exports.getVotingPower = (account) => {
  const totalShares = (parseFloat(account.vesting_shares) +
                       parseFloat(account.received_vesting_shares) -
                       parseFloat(account.delegated_vesting_shares) -
                       parseFloat(account.vesting_withdraw_rate));

  const elapsed = Math.floor(Date.now() / 1000) - account.voting_manabar.last_update_time;
  const maxMana = totalShares * 1000000;

  // 432000 sec = 5 days
  let currentMana = parseFloat(account.voting_manabar.current_mana) + elapsed * maxMana / 432000;

  if (currentMana > maxMana) {
    currentMana = maxMana;
  }

  return (currentMana * 100) / maxMana;
};

/**
 * Get account details by calling steem API.
 * @param {string} accountName: Name of the account.
 * @public
 * @author Jayser Mendez.
 * @returns An object with the account details.
 */
exports.getAccountDetails = async (accountName) => {
  try {
    const payload = encodeURI(`["${accountName}"]`);
    const url = `${config.steemApi}/get_accounts?names[]=${payload}`;

    const response = await axios.get(url);

    return response.data;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

/**
 * Calculates remaining time in seconds for VP to reach 100%.
 * 432000 sec = 5 days -- Recharged amount per 24 hours is 20% 5 * 20 = 100%
 * 4320 sec = 1.2 hours -- Recharged amount per hour is 1.2
 * @param {Number} currentVp: Current voting power amount.
 * @public
 * @author Jayser Mendez.
 * @returns A number determining the amount in seconds needed to reach 100% VP.
 */
exports.calculateNextRoundTime = currentVp => ((100 - currentVp) * 4320);

/**
 * Schedules a next round with a given time
 * @param {number} time: Seconds, minutes, or hours to the next schedule.
 * @param {string} format: 'h' for hour, 'm' for minute, 's' for second.
 * @public
 * @author Jayser Mendez
 */
exports.scheduleNextRound = (time, format) => {
  const nextScheduleDate = moment(new Date()).add(time, format).toDate();
  scheduler.scheduleNextRound(nextScheduleDate);
};

/**
 * Sleeps the system for N ms.
 * @param {number} ms: milliseconds to sleep.
 * @public
 * @author Jayser Mendez
 */
exports.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Adds KNT tokens to the user.
 * @param {string} username: Username.
 * @param {number} score: Score of the post.
 * @public
 * @author Jayser Mendez
 */
exports.addKntToUser = async (username, score) => {
  try {
    const knt = (score * config.maxKNT) / 100;
    await User.findOneAndUpdate({ username }, { $inc: { tokens: knt } }, { upsert: true, multi: true });
  } catch (err) {
    logger.error(err);
  }
};
