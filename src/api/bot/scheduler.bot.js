/* eslint-disable no-unused-vars */
const schedule = require('node-schedule');
const botJob = require('./job.bot');

exports.scheduleNextRound = (date = new Date(new Date().getTime() + 10000)) => {
  const round = schedule.scheduleJob(date, () => {
    botJob.startRound();
  });
};
