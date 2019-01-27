/* eslint-disable no-unused-vars */
const scheduler = require('./scheduler.bot');
const utils = require('./utils.bot');
const logger = require('../../config/logger');
const config = require('../../config/vars');
const botQueue = require('../models/queue.model');

/**
 * Starts the voting round.
 * @param {node-schedule} round: node-schedule object
 * @public
 * @author Jayser Mendez
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
      rescheduleAndCancel(timeToRecharge, 's', round);
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
      rescheduleAndCancel(1, 'h', round);
      return;
    }

    posts.map(async (post) => {
      // Check how much VP will take this vote

      // Process each post
      processPost(post);
    });

    // After done, re-schedule a job
    const t = new Date();
    t.setSeconds(t.getSeconds() + 10);
    scheduler.scheduleNextRound(t);
  } catch (err) {
    logger.error(err);
  }
};

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
   * Process post: upvote, comment, allocate knacktokens.
   * @param {Object} post: Post object.
   * @private
   * @author Jayser Mendez
   */
const processPost = async (post) => {
  try {
    // process post
  } catch (err) {
    logger.error(err);
  }
};

  /**
   *
   * @param {number} time: Seconds, minutes, or hours to the next schedule.
   * @param {string} format: 'h' for hour, 'm' for minute, 's' for second.
   * @param {node-schedule} round: node-schedule object.
   */
const rescheduleAndCancel = (time, format, round) => {
  utils.scheduleNextRound(time, format);
  round.cancel();
};
