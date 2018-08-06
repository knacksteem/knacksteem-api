try {
  require('dotenv').config();
} catch (e) {
  console.error(e);
  console.warn('Configuration file not loaded.');
}

const cron = require('node-schedule');
const logger = require('./configureLogger');

const getVotingPower = require('./getVotingPower');
const getNextEligiblePost = require('./getNextEligiblePost');
const castVote = require('./castVote');
const commentOnPost = require('./commentOnPost');
const getCommentText = require('./getCommentText');
const markPostAsVoted = require('./markPostAsVoted');

cron.scheduleJob(process.env.KNACKBOT_SCHEDULE, () => {
  getVotingPower(process.env.KNACKBOT_USER, vp => {
    if (vp >= (Number(process.env.KNACKBOT_VOTING_THRESHOLD) || 99.98)) {
      logger.info(`Voting power of ${vp} meets threshold.`);
      getNextEligiblePost((err, post) => {
        if (!err) {
          if (post) {
            logger.info(
              `Post found: ${post.permlink} by ${post.author} in ${
                post.category
              }`
            );
            castVote(post, (err, vote_result) => {
              if (!err) {
                logger.info(`Vote cast:${vote_result.id}`);
                markPostAsVoted(post, (err, mark_result) => {
                  if (!err) {
                    logger.info('Post marked as voted.');
                    commentOnPost(
                      post,
                      getCommentText(),
                      (err, comment_result) => {
                        if (!err) {
                          logger.info(`Comment placed:\n${comment_result}`);
                        } else {
                          logger.error(`Error posting comment:\n${err}`);
                        }
                      }
                    );
                  } else {
                    logger.error(
                      `Error marking post as voted:\n ${JSON.stringify(
                        err,
                        null,
                        2
                      )}`
                    );
                  }
                });
              } else {
                logger.error(
                  `Error casting vote:\n${JSON.stringify(err, null, 2)}`
                );
              }
            });
          } else {
            logger.info('Nothing in queue.');
          }
        } else {
          logger.error(
            `Error retreiving voting power:\n${JSON.stringify(err, null, 2)}`
          );
        }
      });
    } else {
      logger.info(`Voting power of ${vp} is below threshold.`);
    }
  });
  logger.info('Job complete.');
});
