const fs = require('fs');
const moment = require('moment');
const logger = require('./logger');
const model = require('./model');
const validator = require('./validator');

module.exports = {
  /**
   * 会議室一の取得
   */
  doGetRooms: function (req, res, next) {
    model
      .getRoomList()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        throw err;
      });
  },

  /**
   * 設定情報の取得
   */
  doGetSetting: function (req, res, next) {
    let jsonData = JSON.parse(fs.readFileSync('./data/setting.json', 'utf8'));
    return res.json(jsonData);
  },

  /**
   * 予約情報一覧の検索
   */
  doGetReservesSearch: function (req, res, next) {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    let dto = req.query;

    model
      .findReserveList(dto)
      .then((data) => {
        return res.json(data);
      })
      .catch((err) => {
        throw err;
      });
  },

  /**
   * 予約情報の取得
   */
  doGetReserves: function (req, res, next) {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    let id = req.params.id;

    model
      .getReserveById(id)
      .then((data) => {
        return res.json(data);
      })
      .catch((err) => {
        throw err;
      });
  },

  /**
   * 予約情報の登録
   */
  doPostReserve: function (req, res, next) {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    let dto = req.body;

    model
      .registReserve(dto)
      .then(() => {
        return res.json({});
      })
      .catch((err) => {
        throw err;
      });
  },

  /**
   * 予約情報の更新
   */
  doPutReserve: function (req, res, next) {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    let id = req.body.id;
    let password = req.body.password;
    let dto = req.body;

    model
      .updateReserve(id, password, dto)
      .then(() => {
        return res.json({});
      })
      .catch((err) => {
        throw err;
      });
  },

  /**
   * 予約情報の取消
   */
  doDeleteReserve: function (req, res, next) {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    let id = req.body.id;
    let password = req.body.password;

    model
      .deleteReserve(id, password)
      .then(() => {
        return res.json({});
      })
      .catch((err) => {
        throw err;
      });
  },
};
