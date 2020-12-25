const log4js = require('log4js');

log4js.configure({
  appenders: {
    consoleLog: {
      type: 'console',
    },
    fileLog: {
      type: 'dateFile',
      filename: './logs/app.log',
      pattern: '-yyyy-MM-dd',
      backups: '30',
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c - %m',
      },
    },
  },
  categories: {
    default: {
      appenders: ['consoleLog', 'fileLog'],
      level: 'debug',
    },
  },
});

const logger = log4js.getLogger('default');

module.exports = logger;
