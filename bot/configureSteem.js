const steem = require('steem');
const logger = require('./configureLogger');

logger.debug(process.env);

if (process.env.KNACKBOT_MODE == 'TEST') {
  const settings = {
    url: process.env.KNACKBOT_STEEM_TEST_URL || 'wss://testnet.steem.vc',
    address_prefix: process.env.KNACKBOT_STEEM_TEST_PREFIX || 'STX',
    chain_id:
      process.env.KNACKBOT_STEEM_TEST_CHAIN_ID ||
      '79276aea5d4877d9a25892eaa01b0adf019d3e5cb12a97478df3298ccdd01673'
  };
  steem.api.setOptions(settings);
  logger.info(
    `Steem url set to test. Settings: \n${JSON.stringify(settings, null, 2)}`
  );
} else {
  steem.api.setOptions({
    url: process.env.KNACKBOT_STEEM_URL || 'https://api.steemit.com'
  });
  logger.info('Steem url set to live.');
}

module.exports = steem;
