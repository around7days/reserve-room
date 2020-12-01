// -----------------------------------------------------------------------------------
// 汎用
// -----------------------------------------------------------------------------------
const fs = require('fs');
const moment = require("moment");
const log4js = require('log4js')

// -----------------------------------------------------------------------------------
// ログ設定
// -----------------------------------------------------------------------------------
/* 標準ログ */
const logger = log4js.getLogger("app");
logger.level = 'debug';

/* アクセスログ */
const accessLogger = log4js.getLogger("access");
accessLogger.level = 'info';

// -----------------------------------------------------------------------------------
// データベース
// -----------------------------------------------------------------------------------
/** sqlite3のロード */
const sqlite3 = require('sqlite3').verbose();

/** 
 * データベースの作成
 */
let db = new sqlite3.Database('./data/sqlite.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    logger.info('Connected to the database "./data/sqlite.db"');
});

// -----------------------------------------------------------------------------------
// サーバAPI
// -----------------------------------------------------------------------------------
/** expressモジュールをロード */
const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const path = require('path');

/* サーバを3000番ポート待ち受け */
const server = app.listen(port, function(){
    logger.info("Node.js is listening to PORT:" + server.address().port);
});

/* CORSを許可する */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/* POSTパラメータを受け取る設定 */
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/* 静的ファイルのルーティング */
app.use(express.static(path.join(__dirname, 'public')));

/* アクセスログ設定 */
app.use(log4js.connectLogger(accessLogger));

/**
 * 会議室一覧を取得するAPI
 */
app.get("/rooms", function(req, res, next){
    // SQL生成
    let sql = `
        select room_id, room_nm
        from m_room
        where del_flg = 0
        order by sort
        `;

    // SQLログ
    logger.debug("sql：" + sql);

    // SQL実行
    db.all(sql, function(err, rows) {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

/**
 * 会議室一覧を取得するAPI
 */
app.get("/setting", function(req, res, next){
    let jsonData = JSON.parse(fs.readFileSync('./data/setting.json', 'utf8'));
    res.json(jsonData);
});

/**
 * 予約情報一覧を取得するAPI
 */
app.get("/reserves/search", function(req, res, next){
    // SQL生成
    let sql = `
        select
            trr.id
            , trr.user_nm
            , trr.dept_nm
            , trr.reason
            , trr.room_id
            , mr.room_nm
            , trr.start_time
            , trr.end_time
        from
            t_room_reserve trr
            inner join m_room mr
                on mr.room_id = trr.room_id
                and mr.del_flg = 0
        where
            1 = 1
            and trr.del_flg = 0
            and date(trr.start_time) = $date
        order by
            trr.room_id
            , trr.start_time
        `;

    // SQLパラメータ
    let param = { "$date" : req.query.date };

    // SQLログ
    logger.debug("sql：" + sql + "[" + JSON.stringify(param) + "]");
    
    // SQL実行
    db.all(sql, param, function(err, rows) {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

/**
 * 予約情報を取得するAPI
 */
app.get("/reserves/:id", function(req, res, next){
    // SQL生成
    let sql = `
        select
            *
        from
            t_room_reserve
        where
            id = $id
            and del_flg = 0
        `;

    // SQLパラメータ
    let param = { "$id" : req.params.id };

    // SQLログ
    logger.debug("sql：" + sql + "[" + JSON.stringify(param) + "]");

    // SQL実行
    db.get(sql, param, function(err, row) {
        if (err) {
            throw err;
        }
        res.json(row);
    });
});

/**
 * 予約情報を登録するAPI
 */
app.post("/reserve", function(req, res, next){
    // SQL生成
    let sql = `
        insert into t_room_reserve (user_nm, dept_nm, reason, room_id, start_time, end_time, password, ins_date, upd_date, del_flg)
        values ($user_nm, $dept_nm, $reason, $room_id, datetime($start_time), datetime($end_time), $password, datetime('now'), datetime('now'), 0);
        `;

    // SQLパラメータ
    let param = {
        "$user_nm" : req.body.user_nm
        , "$dept_nm" : req.body.dept_nm
        , "$reason" : req.body.reason
        , "$room_id" : req.body.room_id
        , "$start_time" : req.body.date + " " + req.body.start_time
        , "$end_time" : req.body.date + " " + req.body.end_time
        , "$password" : req.body.password
    };

    // SQLログ
    logger.debug("sql：" + sql + "[" + JSON.stringify(param) + "]");

    // SQL実行
    db.run(sql, param, function(err) {
        if (err) {
            throw err;
        }
        res.json({});
    });
});

/**
 * 予約情報を変更するAPI
 */
app.put("/reserve", function(req, res, next){
    // SQL生成
    let sql = `
        update t_room_reserve 
        set
            user_nm = $user_nm
            , dept_nm = $dept_nm
            , reason = $reason
            , room_id = $room_id
            , start_time = $start_time
            , end_time = $end_time
            , upd_date = datetime('now')
        where
            id = $id
        `;

    // SQLパラメータ
    let param = {
        "$id" : req.body.id
        , "$user_nm" : req.body.user_nm
        , "$dept_nm" : req.body.dept_nm
        , "$reason" : req.body.reason
        , "$room_id" : req.body.room_id
        , "$start_time" : req.body.date + " " + req.body.start_time
        , "$end_time" : req.body.date + " " + req.body.end_time
    };

    // SQLログ
    logger.debug("sql：" + sql + "[" + JSON.stringify(param) + "]");

    // SQL実行
    db.run(sql, param, function(err) {
        if (err) {
            throw err;
        }
        res.json({});
    });
});

/**
 * 予約情報を取消するAPI
 */
app.delete("/reserve", function(req, res, next){
    // SQL生成
    let sql = `
        update t_room_reserve 
        set
            del_flg = 1
            , upd_date = datetime('now')
        where
            id = $id
        `;

    // SQLパラメータ
    let param = {
        "$id" : req.body.id
    };

    // SQLログ
    logger.debug("sql：" + sql + "[" + JSON.stringify(param) + "]");

    // SQL実行
    db.run(sql, param, function(err) {
        if (err) {
            throw err;
        }
        res.json({});
    });
});

