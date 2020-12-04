// -----------------------------------------------------------------------------------
// サーバ設定
// -----------------------------------------------------------------------------------
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const log4js = require('log4js');
const router = require('./router');
const logger = require('./logger');

/* サーバを3000番ポート待ち受け */
const server = app.listen(port, function () {
  logger.info('Node.js is listening to PORT:' + server.address().port);
});

/* CORSを許可する */
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

/* JSONのレスポンス設定 */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ルーティング設定 */
app.use('/', router);
app.use(express.static(path.join(__dirname, '../public')));

/* アクセスログ設定 */
const accessLogger = log4js.getLogger('access');
app.use(log4js.connectLogger(accessLogger, { level: 'auto' }));

module.exports = app;