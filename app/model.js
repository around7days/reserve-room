const sqlite3 = require('sqlite3').verbose();
const logger = require('./logger');

/**
 * データベースの作成
 */
let db = new sqlite3.Database('./data/sqlite.db', (err) => {
  if (err) {
    logger.error(err.message);
  }
  logger.info('Connected to the database "./data/sqlite.db"');
});

module.exports = {
  /**
   * 会議室一の取得
   * @returns 会議室一覧
   */
  getRoomList: function () {
    return new Promise((resolve, reject) => {
      // SQL生成
      let sql = `
                select room_id, room_nm
                from m_room
                where del_flg = 0
                order by sort
                `;

      // SQLログ
      logger.debug('sql：' + sql);

      // SQL実行
      db.all(sql, function (err, rows) {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  },

  /**
   * 予約情報一覧の検索
   * @param dto 抽出条件
   */
  findReserveList: function (dto) {
    return new Promise((resolve, reject) => {
      // 追加する条件設定
      let addWhere = '';
      let param = {};

      // ID
      if (dto['id']) {
        addWhere += 'and trr.id = $id';
        param['$id'] = dto['id'];
      }
      // 日付
      if (dto['date']) {
        addWhere += 'and date(trr.start_time) = $date';
        param['$date'] = dto['date'];
      }
      // 日付（From）
      if (dto['start_date']) {
        addWhere += 'and date(trr.start_time) >= $start_date';
        param['$start_date'] = dto['start_date'];
      }
      // 日付（To）
      if (dto['end_date']) {
        addWhere += 'and date(trr.end_time) <= $end_date';
        param['$end_date'] = dto['end_date'];
      }

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
                    ${addWhere}
                order by
                    trr.room_id
                    , trr.start_time
                `;

      // SQLログ
      logger.debug('sql：' + sql + '[' + JSON.stringify(param) + ']');

      // SQL実行
      db.all(sql, param, function (err, rows) {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  },

  /**
   * 予約情報の取得
   * @param id 予約ID
   */
  getReserveById: function (id) {
    return new Promise((resolve, reject) => {
      // SQL生成
      let sql = `
                select *
                from t_room_reserve
                where id = $id
                and del_flg = 0
                `;

      // SQLパラメータ
      let param = { $id: id };

      // SQLログ
      logger.debug('sql：' + sql + '[' + JSON.stringify(param) + ']');

      // SQL実行
      db.get(sql, param, function (err, row) {
        if (err) {
          reject(err);
        }
        resolve(row);
      });
    });
  },

  /**
   * 予約情報の登録
   * @param dto 登録情報
   */
  registReserve: function (dto) {
    return new Promise((resolve, reject) => {
      // SQL生成
      let sql = `
                insert into t_room_reserve
                    (user_nm, dept_nm, reason, room_id, start_time, end_time, password, ins_date, upd_date, del_flg)
                values
                    ($user_nm, $dept_nm, $reason, $room_id, datetime($start_time), datetime($end_time), $password, datetime('now', 'localtime'), datetime('now', 'localtime'), 0);
                `;

      // SQLパラメータ
      let param = {
        $user_nm: dto.user_nm,
        $dept_nm: dto.dept_nm,
        $reason: dto.reason,
        $room_id: dto.room_id,
        $start_time: dto.date + ' ' + dto.start_time,
        $end_time: dto.date + ' ' + dto.end_time,
        $password: dto.password,
      };

      // SQLログ
      logger.debug('sql：' + sql + '[' + JSON.stringify(param) + ']');

      // SQL実行
      db.run(sql, param, function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  },

  /**
   * 予約情報の変更
   * @param id 予約ID
   * @param password パスワード
   * @param dto 変更情報
   */
  updateReserve: function (id, password, dto) {
    return new Promise((resolve, reject) => {
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
                    , upd_date = datetime('now', 'localtime')
                where
                    id = $id
                `;

      // SQLパラメータ
      let param = {
        $id: id,
        $user_nm: dto.user_nm,
        $dept_nm: dto.dept_nm,
        $reason: dto.reason,
        $room_id: dto.room_id,
        $start_time: dto.date + ' ' + dto.start_time,
        $end_time: dto.date + ' ' + dto.end_time,
      };

      // SQLログ
      logger.debug('sql：' + sql + '[' + JSON.stringify(param) + ']');

      // SQL実行
      db.run(sql, param, function (err) {
        if (err) {
          reject(err);
        }
        resolve({});
      });
    });
  },

  /**
   * 予約情報を取消するAPI
   * @param id 予約ID
   * @param password パスワード
   */
  deleteReserve: function (id, password) {
    return new Promise((resolve, reject) => {
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
        $id: id,
      };

      // SQLログ
      logger.debug('sql：' + sql + '[' + JSON.stringify(param) + ']');

      // SQL実行
      db.run(sql, param, function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  },
};
