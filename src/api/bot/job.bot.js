/* eslint-disable no-unused-vars */
const scheduler = require('./scheduler.bot');
const utils = require('./utils.bot');
const logger = require('../../config/logger');
const config = require('../../config/vars');

exports.startRound = async () => {
  try {
    logger.info('Starting voting round');

    /**
     * Determine the current voting power
     */
    const userData = await utils.getAccountDetails('utopian-io');
    const currentVp = utils.getVotingPower(userData[0]);
    logger.info(`Current voting power: ${currentVp}`);

    if (currentVp < 100) {
      logger.info('Voting power not enough to start this round. Calculating time for next round');

      const timeToRechargeSeconds = utils.calculateNextRoundTime(currentVp);
      const timeToRechargeMinutes = Math.floor(timeToRechargeSeconds / 60);

      logger.info(`Next round will start in ${timeToRechargeMinutes} minutes`);
    }

    // After done, re-schedule a job
    const t = new Date();
    t.setSeconds(t.getSeconds() + 10);
    scheduler.scheduleNextRound(t);
  } catch (err) {
    logger.error(err);
  }
};
