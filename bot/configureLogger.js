const logger = require('log4js').getLogger('knackbot');
logger.level = process.env.KNACKBOT_LOGGING || 'debug';

module.exports = logger;
