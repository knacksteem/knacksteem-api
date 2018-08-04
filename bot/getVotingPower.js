const logger = require('./configureLogger');

module.exports = (user, callback) => {
  const steem = require('./configureSteem');
  steem.api.getAccounts([user], (err, response) => {
    if (!err) {
      if (response.length > 0) {
        const secondsago =
          (new Date() - new Date(response[0].last_vote_time + 'Z')) / 1000;
        const vpow = Math.min(
          (response[0].voting_power + 10000 * secondsago / 432000) / 100,
          100
        ).toFixed(2);
        callback(vpow);
      } else {
        logger.warn(
          `Cannot act on response for ${user}. Received:\n ${response}`
        );
      }
    } else {
      logger.error(err);
    }
  });
};
