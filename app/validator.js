const { check, validationResult } = require('express-validator/check');
const logger = require('./logger');

module.exports = {
  /**
   * 予約情報一覧の検索
   */
  doGetReservesSearch: [],

  /**
   * 予約情報の取得
   */
  doGetReserves: [check('id').not().isEmpty().withMessage('予約ID：必須入力です')],

  /**
   * 予約情報の登録
   */
  doPostReserve: [
    check('user_nm').not().isEmpty().withMessage('氏名：必須入力です'),
    check('dept_nm').not().isEmpty().withMessage('部署：必須入力です'),
    check('room_id').not().isEmpty().withMessage('会議室：必須入力です'),
    check('reason').not().isEmpty().withMessage('利用用途：必須入力です'),
    check('date').not().isEmpty().withMessage('日付：必須入力です'),
    check('start_time').not().isEmpty().withMessage('開始時刻：必須入力です'),
    check('end_time').not().isEmpty().withMessage('終了時刻：必須入力です'),
    check('password').not().isEmpty().withMessage('パスワード：必須入力です'),
  ],

  /**
   * 予約情報の更新
   */
  doPutReserve: [
    check('id').not().isEmpty().withMessage('予約ID：必須入力です'),
    check('user_nm').not().isEmpty().withMessage('氏名：必須入力です'),
    check('dept_nm').not().isEmpty().withMessage('部署：必須入力です'),
    check('room_id').not().isEmpty().withMessage('会議室：必須入力です'),
    check('reason').not().isEmpty().withMessage('利用用途：必須入力です'),
    check('date').not().isEmpty().withMessage('日付：必須入力です'),
    check('start_time').not().isEmpty().withMessage('開始時刻：必須入力です'),
    check('end_time').not().isEmpty().withMessage('終了時刻：必須入力です'),
    check('password').not().isEmpty().withMessage('パスワード：必須入力です'),
  ],

  /**
   * 予約情報の取消
   */
  doDeleteReserve: [
    check('id').not().isEmpty().withMessage('予約ID：必須入力です'), //
    check('password').not().isEmpty().withMessage('パスワード：必須入力です'),
  ],

  /** エラーチェック結果情報 */
  validationResult,
};
