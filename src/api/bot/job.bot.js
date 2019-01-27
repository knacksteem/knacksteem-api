/* eslint-disable no-unused-vars */
const scheduler = require('./scheduler.bot');
const utils = require('./utils.bot');
const logger = require('../../config/logger');
const config = require('../../config/vars');
const moment = require('moment');

exports.startRound = async (round) => {
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

      /**
       * Calculate remaining time to reach 100%
       */
      const timeToRechargeSeconds = utils.calculateNextRoundTime(currentVp);
      const timeToRechargeMinutes = Math.floor(timeToRechargeSeconds / 60);

      logger.info(`Next round will start in ${timeToRechargeMinutes} minutes`);

      /**
       * schedule next round
       */
      const nextScheduleDate = moment(new Date()).add(timeToRechargeMinutes, 'm').toDate();
      scheduler.scheduleNextRound(nextScheduleDate);

      /**
       * Cancel current round and stop the funciton.
       */
      round.cancel();
      return;
    }

    // After done, re-schedule a job
    const t = new Date();
    t.setSeconds(t.getSeconds() + 10);
    scheduler.scheduleNextRound(t);
  } catch (err) {
    logger.error(err);
  }
};
