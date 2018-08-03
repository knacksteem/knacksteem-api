try {
  require('dotenv').config();
} catch (e) {
  console.error(e);
  console.log('Configuration file not loaded.');
}

const config = {
  username: process.env.KNACKBOT_USER || 'knacksteem.org',
  postingKey: process.env.KNACKBOT_KEY || ''
};

const steembot = require('steem-bot').default;

const knackbot = new steembot(config);

knackbot.start();
