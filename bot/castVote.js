const configureSteem = require('./configureSteem');
const logger = require('./configureLogger');

module.exports = (post, callback) => {
  const steem = configureSteem();
  logger.debug(`${process.env.KNACKBOT_KEY},
    ${process.env.KNACKBOT_USER},
    ${post.author},
    ${post.permlink},
    ${process.env.KNACKBOT_DEFAULT_WEIGHT}`);

  let weight = Number(process.env.KNACKBOT_DEFAULT_WEIGHT) || 10000;

  steem.broadcast.vote(
    process.env.KNACKBOT_KEY,
    process.env.KNACKBOT_USER,
    post.author,
    post.permlink,
    weight,
    (err, result) => {
      if (!err) {
        callback(null, result);
      } else {
        callback(err);
      }
    }
  );
};
