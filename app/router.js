const express = require('express');
const router = express.Router();
const controller = require('./controller');

/** 会議室一覧を取得するAPI */
router.get('/rooms', controller.doGetRooms);
/** 設定情報を取得するAPI */
router.get('/setting', controller.doGetSetting);
/** 予約情報一覧を取得するAPI */
router.get('/reserves/search', controller.doGetReservesSearch);
/** 予約情報を取得するAPI */
router.get('/reserves/:id', controller.doGetReserve);
/** 予約情報を登録するAPI */
router.post('/reserve', controller.doPostReserve);
/** 予約情報を変更するAPI */
router.put('/reserve', controller.doPutReserve);
/** 予約情報を削除するAPI */
router.delete('/reserve', controller.doDeleteReserve);

module.exports = router;
