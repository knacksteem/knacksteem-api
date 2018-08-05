try {
  require('dotenv').config();
} catch (e) {
  console.error(e);
  console.warn('Configuration file not loaded.');
}

const cron = require('node-schedule');
const logger = require('./configureLogger');
const getVotingPower = require('./getVotingPower');
const checkForEligiblePost = require('./checkForEligiblePost');

cron.scheduleJob(process.env.KNACKBOT_SCHEDULE, () => {
  getVotingPower(process.env.KNACKBOT_USER, vp => {
    if (vp >= (Number(process.env.KNACKBOT_VOTING_THRESHOLD) || 99.98)) {
      logger.info(`Voting power of ${vp} meets threshold.`);
    } else {
      logger.info(`Voting power of ${vp} is below threshold.`);
    }
  });
});
