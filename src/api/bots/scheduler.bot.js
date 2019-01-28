const schedule = require('node-schedule');
const botJob = require('./curation.bot');
const delegatorsJob = require('./delegators.bot');

/**
 * Schedules the next voting round.
 * @param {Date} date: Date of the next voting round
 * @public
 * @author Jayser Mendez
 */
exports.scheduleNextVotingRound = (date) => {
  const round = schedule.scheduleJob(date, () => {
    botJob.startRound(round);
  });
};

/**
 * Schedues delegators token distribution.
 * @public
 * @author Jayser Mendez
 */
exports.scheduleDelegatorsBot = () => {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(0, 6)];
  rule.hour = 12;
  rule.minute = 0;
  const round = schedule.scheduleJob(rule, () => {
    delegatorsJob.startTokenDistribution(round);
  });
};
