/* eslint-disable no-unused-vars */
const scheduler = require('./scheduler.bot');
const utils = require('./utils.bot');
const logger = require('../../config/logger');
const config = require('../../config/vars');
const botQueue = require('../models/queue.model');

/**
 * Gets all posts into the bot queue.
 * @private
 * @author Jayser Mendez
 * @returns An array with the posts.
 */
const getPostsQueue = async () => {
  try {
    return await botQueue.find().sort({ createdAt: 1 });
  } catch (err) {
    logger.error(err);
    return [];
  }
};

/**
 * Starts the voting round.
 * @param {node-schedule} round: node-schedule object
 * @public
 */
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
      const timeToRecharge = utils.calculateNextRoundTime(currentVp);

      logger.info(`Next round will start in ${Math.floor(timeToRecharge / 60)} minutes`);

      /**
       * schedule next round, cancel current round, and stop the function.
       */
      utils.scheduleNextRound(timeToRecharge, 's');
      round.cancel();
      return;
    }

    /**
     * Check the queue for pending posts.
     */
    const posts = await getPostsQueue();

    if (posts.length === 0) {
      logger.info('There are not posts to vote. Scheduling voting round to one hour later.');

      /**
       * schedule next round, cancel current round, and stop the function.
       */
      utils.scheduleNextRound(1, 'h');
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
