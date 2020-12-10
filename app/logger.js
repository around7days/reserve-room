const log4js = require('log4js');

const logger = log4js.getLogger('app');
logger.level = 'debug';

const accessLogger = log4js.getLogger('access');
accessLogger.level = 'debug';

module.exports = logger;
