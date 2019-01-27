/* eslint-disable no-unused-vars */
const schedule = require('node-schedule');
const botJob = require('./job.bot');

exports.scheduleNextRound = (date) => {
  const round = schedule.scheduleJob(date, () => {
    botJob.startRound(round);
  });
};
