// -----------------------------------------------------------------------------------
// サーバ設定
// -----------------------------------------------------------------------------------
const express = require('express');
const app = express();
const path = require('path');
const log4js = require('log4js');
const router = require('./router');
const logger = require('./logger');

/* アクセスログ設定 */
app.use(log4js.connectLogger(logger));

/* サーバを3000番ポート待ち受け */
const port = 3000;
const server = app.listen(port, () => {
  logger.info('Node.js is listening to PORT:' + server.address().port);
  logger.info('index url: http://localhost:' + port + '/main.html');
});

/* CORSを許可する */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Csrftoken');
  res.header('Access-Control-Allow-Methods', 'PUT, DELETE');
  next();
});

/* JSONのレスポンス設定 */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ルーティング設定 */
app.use('/', router);
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../documents')));

module.exports = app;
