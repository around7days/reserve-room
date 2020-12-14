const util = require('util');
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

db.on('trace', (sql) => {
  logger.debug(sql);
});

module.exports = {
  /**
   * 会議室一の取得
   * @returns 会議室一覧
   */
  getRoomList: async function () {
    // SQL生成
    let sql = `
      select room_id, room_nm
      from m_room
      where del_flg = 0
      order by sort
    `;

    // SQL実行
    let rows = await util.promisify(db.all).bind(db)(sql);
    return rows;
  },

  /**
   * 予約情報一覧の検索
   * @param dto 抽出条件
   * @returns 予約情報一覧
   */
  findReserveList: async function (dto) {
    // 追加する条件設定
    let addWhere = '';
    let param = {};

    // ID
    if (dto['id']) {
      addWhere += 'and id = $id';
      param['$id'] = dto['id'];
    }
    // 月
    if (dto['month']) {
      addWhere += "and strftime('%Y-%m', start_time) = $month";
      param['$month'] = dto['month'];
    }
    // 日付
    if (dto['date']) {
      addWhere += 'and date(start_time) = $date';
      param['$date'] = dto['date'];
    }
    // 日付（From）
    if (dto['start_date']) {
      addWhere += 'and date(start_time) >= $start_date';
      param['$start_date'] = dto['start_date'];
    }
    // 日付（To）
    if (dto['end_date']) {
      addWhere += 'and date(end_time) <= $end_date';
      param['$end_date'] = dto['end_date'];
    }

    // SQL生成
    let sql = `
      select *
      from v_room_reserve
      where 
        1 = 1
        ${addWhere}
      order by
        room_id, start_time
    `;

    // SQL実行
    let rows = await util.promisify(db.all).bind(db)(sql, param);
    return rows;
  },

  /**
   * 予約情報の取得（1件）
   * @param id 予約ID
   * @returns 予約情報（1件）
   */
  getReserveById: async function (id) {
    // SQL生成
    let sql = `
      select *
      from v_room_reserve
      where id = $id
    `;

    // SQLパラメータ
    let param = { $id: id };

    let row = await util.promisify(db.get).bind(db)(sql, param);
    return row;
  },

  /**
   * 予約情報の重複チェック<br>
   * 予約IDの指定がある場合は予約IDに紐づく予約は除外して重複チェックを行う。
   * @param roomId 会議室ID
   * @param startTime 開始時刻
   * @param endTime 終了時刻
   * @param id 予約ID
   * @param 結果[true:重複あり]
   */
  isDuplicateReserve: async function (roomId, startTime, endTime, id) {
    // 追加する条件設定
    let addWhere = '';
    let param = {};

    // 会議室ID
    param['$room_id'] = roomId;
    // 開始時刻
    param['$start_time'] = startTime;
    // 終了時刻
    param['$end_time'] = endTime;

    if (id != null) {
      addWhere += 'and id != $id';
      param['$id'] = id;
    }

    // SQL生成
    let sql = `
      select count(*) as cnt
      from v_room_reserve 
      where
        1 = 1 
        and room_id = $room_id
        and ( 
          datetime($start_time) between start_time and end_time 
          or datetime($end_time) between start_time and end_time
        )
        and datetime($start_time) != end_time
        and datetime($end_time) != start_time
        ${addWhere}
    `;

    // SQL実行
    let row = await util.promisify(db.get).bind(db)(sql, param);
    return row.cnt > 0;
  },

  /**
   * 予約情報のパスワード認証チェック
   * @param id 予約ID
   * @param password パスワード
   * @returns 結果[true:権限あり、false：権限無し]
   */
  isAuthReserve: async function (id, password) {
    // SQL生成
    let sql = `
      select count(*) as cnt
      from t_room_reserve
      where id = $id
      and password = $password
    `;

    // SQLパラメータ
    let param = { $id: id, $password: password };

    let row = await util.promisify(db.get).bind(db)(sql, param);
    return row.cnt > 0;
  },

  /**
   * 予約情報の登録
   * @param dto 登録情報
   */
  registReserve: async function (dto) {
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
      $start_time: dto.start_time,
      $end_time: dto.end_time,
      $password: dto.password,
    };

    let ret = await util.promisify(db.run).bind(db)(sql, param);
    return ret;
  },

  /**
   * 予約情報の変更
   * @param id 予約ID
   * @param dto 変更情報
   */
  updateReserve: async function (id, dto) {
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
      $start_time: dto.start_time,
      $end_time: dto.end_time,
    };

    // SQL実行
    let ret = await util.promisify(db.run).bind(db)(sql, param);
    return ret;
  },

  /**
   * 予約情報を取消するAPI
   * @param id 予約ID
   */
  deleteReserve: async function (id) {
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

    // SQL実行
    let ret = await util.promisify(db.run).bind(db)(sql, param);
    return ret;
  },
};
