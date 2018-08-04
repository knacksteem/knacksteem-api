const logger = require('log4js').getLogger();
logger.level = process.env.KNACKBOT_LOGGING || 'debug';

module.exports = logger;
