const { check, body, oneOf, validationResult } = require('express-validator');
const logger = require('./logger');
const model = require('./model');
const moment = require('moment');

/**
 * 日付の妥当性チェック
 * @param value
 * @param format
 * @returns 結果[true:正常]
 */
function isDate(value, format) {
  if (!value) {
    return true;
  }
  return moment(value, format, true).isValid();
}

/**
 * 日付の相関チェック
 * @param strFromDate
 * @param strToDate
 * @param format
 */
function isDateRange(strFromDate, strToDate, format) {
  if (!strFromDate || !strToDate) {
    return true;
  }

  let fromDate = moment(strFromDate, format);
  let toDate = moment(strToDate, format);
  if (fromDate.isSameOrAfter(toDate)) {
    return false; // エラー
  }
  return true;
}

/**
 * 日付の妥当性チェック<br>
 * （YYYY-MM-DD形式）
 * @param value
 * @returns 結果[true:正常]
 */
function isValidDateYMD(value, { req }) {
  return isDate(value, 'YYYY-MM-DD');
}

/**
 * 日付の妥当性チェック<br>
 * （YYYY-MM形式）
 * @param value
 * @returns 結果[true:正常]
 */
function isValidDateYM(value, { req }) {
  return isDate(value, 'YYYY-MM');
}

/**
 * 日付の妥当性チェック<br>
 * （HH:mm形式）
 * @param value
 * @returns 結果[true:正常]
 */
function isValidDateHm(value, { req }) {
  return isDate(value, 'HH:mm');
}

/**
 * 日付の妥当性チェック<br>
 * （YYYY-MM-DD HH:mm形式）
 * @param value
 * @returns 結果[true:正常]
 */
function isValidDateYMDHm(value, { req }) {
  return isDate(value, 'YYYY-MM-DD HH:mm');
}

module.exports = {
  /**
   * 予約情報の取得（1件）
   */
  doGetReserveId: [check('id').not().isEmpty().withMessage('予約ID：必須入力です')],

  /**
   * 予約情報一覧の検索
   */
  doGetReservesSearch: [
    check('date').custom(isValidDateYMD).withMessage('日付：フォーマットが正しくありません（YYYY-MM-DD）'),
    check('month').custom(isValidDateYM).withMessage('月：フォーマットが正しくありません（YYYY-MM）'),
    check('start_date').custom(isValidDateYMD).withMessage('開始日付：フォーマットが正しくありません（YYYY-MM-DD）'),
    check('end_date').custom(isValidDateYMD).withMessage('終了日付：フォーマットが正しくありません（YYYY-MM-DD）'),
  ],

  /**
   * 予約情報の登録
   */
  doPostReserve: [
    check('user_nm').not().isEmpty().withMessage('氏名：必須入力です'),
    check('dept_nm').not().isEmpty().withMessage('部署：必須入力です'),
    check('room_id').not().isEmpty().withMessage('会議室：必須入力です'),
    check('reason').not().isEmpty().withMessage('利用用途：必須入力です'),
    // check('date')
    //   .not()
    //   .isEmpty()
    //   .withMessage('日付：必須入力です')
    //   .bail()
    //   .custom(isValidDateYMD)
    //   .withMessage('日付：フォーマットが正しくありません（YYYY-MM-DD）'),
    check('start_time')
      .not()
      .isEmpty()
      .withMessage('開始時刻：必須入力です')
      .bail()
      .custom(isValidDateYMDHm)
      .withMessage('開始時刻：フォーマットが正しくありません（YYYY-MM-DD HH:mm）'),
    check('end_time')
      .not()
      .isEmpty()
      .withMessage('終了時刻：必須入力です')
      .bail()
      .custom(isValidDateYMDHm)
      .withMessage('終了時刻：フォーマットが正しくありません（YYYY-MM-DD HH:mm）'),
    check('password').not().isEmpty().withMessage('パスワード：必須入力です'),
    body()
      .custom((value, { req }) => {
        if (!validationResult(req).isEmpty()) {
          return true;
        }
        return isDateRange(req.body['start_time'], req.body['end_time'], 'YYYY-MM-DD HH:mm');
      })
      .withMessage('開始時刻と終了時刻の範囲が正しくありません'),
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
    // check('date')
    //   .not()
    //   .isEmpty()
    //   .withMessage('日付：必須入力です')
    //   .bail()
    //   .custom(isValidDateYMD)
    //   .withMessage('日付：フォーマットが正しくありません（YYYY-MM-DD）'),
    check('start_time')
      .not()
      .isEmpty()
      .withMessage('開始時刻：必須入力です')
      .bail()
      .custom(isValidDateYMDHm)
      .withMessage('開始時刻：フォーマットが正しくありません（YYYY-MM-DD HH:mm）'),
    check('end_time')
      .not()
      .isEmpty()
      .withMessage('終了時刻：必須入力です')
      .bail()
      .custom(isValidDateYMDHm)
      .withMessage('終了時刻：フォーマットが正しくありません（YYYY-MM-DD HH:mm）'),
    check('password').not().isEmpty().withMessage('パスワード：必須入力です'),
    body()
      .custom((value, { req }) => {
        if (!validationResult(req).isEmpty()) {
          return true;
        }
        return isDateRange(req.body['start_time'], req.body['end_time'], 'YYYY-MM-DD HH:mm');
      })
      .withMessage('開始時刻と終了時刻の範囲が正しくありません'),
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
