const fs = require('fs');
const moment = require('moment');
const logger = require('./logger');
const model = require('./model');
const validator = require('./validator');

/**
 * 予約情報の重複チェック<br>
 * 予約IDの指定がある場合は予約IDに紐づく予約は除外して重複チェックを行う。
 * @returns 結果[true:重複あり]
 */
async function isDuplicateReserve(dto) {
  let roomId = dto['room_id'];
  let startDateTime = dto['date'] + ' ' + dto['start_time'];
  let endDateTime = dto['date'] + ' ' + dto['end_time'];
  let id = dto['id'];
  let isDuplicate = await model.isDuplicateReserve(roomId, startDateTime, endDateTime, id);
  return isDuplicate;
}

module.exports = {
  /**
   * 設定情報の取得
   */
  doGetSetting: function (req, res, next) {
    let data = JSON.parse(fs.readFileSync('./data/setting.json', 'utf8'));
    return res.json(data);
  },

  /**
   * 会議室一の取得
   */
  doGetRooms: async function (req, res, next) {
    let data = await model.getRoomList();
    return res.json(data);
  },

  /**
   * 予約情報の取得（1件）
   */
  doGetReserveId: async function (req, res, next) {
    // 単項目チェック
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    // メイン処理
    let id = req.params.id;
    let data = await model.getReserveById(id);
    if (!data) {
      return res.json({});
    }

    // 結果返却
    return res.json(data);
  },

  /**
   * 予約情報一覧の検索
   */
  doGetReservesSearch: async function (req, res, next) {
    // 単項目チェック
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    // メイン処理
    let dto = req.query;
    let data = await model.findReserveList(dto);

    // 結果返却
    return res.json(data);
  },

  /**
   * 予約情報の登録
   */
  doPostReserve: async function (req, res, next) {
    // 単項目チェック
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    // パラメータ
    let dto = req.body;

    // 独自チェック（予約情報の重複チェック）
    let isDuplicate = await isDuplicateReserve(dto);
    if (isDuplicate) {
      errors['errors'] = [{ msg: '既に他の予約情報が登録されています' }];
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    // メイン処理
    await model.registReserve(dto);

    // 結果返却
    return res.json({});
  },

  /**
   * 予約情報の更新
   */
  doPutReserve: async function (req, res, next) {
    // 単項目チェック
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    // パラメータ
    let id = req.body.id;
    let password = req.body.password;
    let dto = req.body;

    // 独自チェック（予約情報のパスワード一致チェック）
    let isAuth = await model.isAuthReserve(id, password);
    if (!isAuth) {
      errors['errors'] = [{ msg: 'パスワードが一致しません' }];
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    // 独自チェック（予約情報の重複チェック）
    let isDuplicate = await isDuplicateReserve(dto);
    if (isDuplicate) {
      errors['errors'] = [{ msg: '既に他の予約情報が登録されています' }];
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    // メイン処理
    await model.updateReserve(id, dto);

    // 結果返却
    return res.json({});
  },

  /**
   * 予約情報の取消
   */
  doDeleteReserve: async function (req, res, next) {
    // 単項目チェック
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    // パラメータ
    let id = req.body.id;
    let password = req.body.password;

    // 独自チェック（予約情報のパスワード一致チェック）
    let isAuth = await model.isAuthReserve(id, password);
    if (!isAuth) {
      errors['errors'] = [{ msg: 'パスワードが一致しません' }];
      logger.debug('errors:' + JSON.stringify(errors));
      return res.json(errors);
    }

    // メイン処理
    await model.deleteReserve(id);

    // 結果返却
    return res.json({});
  },
};
