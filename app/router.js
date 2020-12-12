const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validator = require('./validator');
const logger = require('./logger');

/** 会議室一覧を取得するAPI */
router.get('/rooms', controller.doGetRooms);
/** 予約情報（1件）を取得するAPI */
router.get('/reserve/:id', validator.doGetReserveId, controller.doGetReserveId);
/** 予約情報一覧を取得するAPI */
router.get('/reserves/search', validator.doGetReservesSearch, controller.doGetReservesSearch);
/** 予約情報を登録するAPI */
router.post('/reserve', validator.doPostReserve, controller.doPostReserve);
/** 予約情報を変更するAPI */
router.put('/reserve', validator.doPutReserve, controller.doPutReserve);
/** 予約情報を削除するAPI */
router.delete('/reserve', validator.doDeleteReserve, controller.doDeleteReserve);

module.exports = router;
