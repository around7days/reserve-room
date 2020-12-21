const log4js = require('log4js');

log4js.configure({
  appenders: {
    consoleLog: {
      type: 'console',
    },
    fileLog: {
      type: 'file',
      filename: './log/app.log',
      pattern: '-yyyy-MM-dd',
      backups: '30',
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
