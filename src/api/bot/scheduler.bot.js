const schedule = require('node-schedule');
const botJob = require('./job.bot');

/**
 * Schedules the next voting round.
 * @param {Date} date: Date of the next voting round
 */
exports.scheduleNextRound = (date) => {
  const round = schedule.scheduleJob(date, () => {
    botJob.startRound(round);
  });
};
