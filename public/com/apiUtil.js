// const SERVER_URL = ''; // 本番用設定
const SERVER_URL = 'http://localhost:3000'; // TODO テスト用設定

class ApiUtil {
  /**
   * スケジュール定義情報の取得
   * @returns スケジュール定義情報
   */
  static getScheduleDefine() {
    let jsonData;
    $.ajax({
      url: SERVER_URL + '/setting',
      type: 'GET',
      dataType: 'json',
      async: false,
    })
      .done((data) => {
        jsonData = data;
      })
      .fail((res) => {
        alert('設定情報の取得に失敗しました');
      });
    return jsonData['schedule_define'];
  }

  /**
   * 会議室一覧の取得
   * @returns 会議室一覧
   */
  static getRoomList() {
    let jsonData;
    $.ajax({
      url: SERVER_URL + '/rooms',
      type: 'GET',
      dataType: 'json',
      async: false,
    })
      .done((data) => {
        jsonData = data;
      })
      .fail((res) => {
        alert('会議室一覧の取得に失敗しました');
      });
    return jsonData;
  }

  /**
   * 予約情報をサーバから取得
   * @param targetDate 対象日付（moment）
   * @returns 予約情報
   */
  static getReserveList(targetDate) {
    let jsonData;
    $.ajax({
      url: SERVER_URL + '/reserves/search',
      type: 'GET',
      dataType: 'json',
      data: { date: targetDate.format('YYYY-MM-DD') },
      async: false,
    })
      .done((data) => {
        jsonData = data;
      })
      .fail((res) => {
        alert('予約情報の取得に失敗しました');
      });

    // TODO ★データレイアウトの加工
    jsonData.forEach((data) => {
      data['date'] = moment(data['start_time']).format('YYYY-MM-DD');
      data['start_time'] = moment(data['start_time']).format('HH:mm');
      data['end_time'] = moment(data['end_time']).format('HH:mm');
    });
    return jsonData;
  }

  /**
   * 予約情報の登録処理
   * @param data 予約情報
   * @param callback 処理成功時のコールバック関数
   */
  static registReserve(data, callback) {
    // TODO ★データレイアウトの加工
    // data['start_time'] = data['date'] + ' ' + data['start_time'];
    // data['end_time'] = data['date'] + ' ' + data['end_time'];

    $.ajax({
      url: SERVER_URL + '/reserve',
      type: 'POST',
      dataType: 'json',
      data: {
        user_nm: data['user_nm'],
        dept_nm: data['dept_nm'],
        room_id: data['room_id'],
        reason: data['reason'],
        date: data['date'],
        start_time: data['start_time'],
        end_time: data['end_time'],
        password: data['password'],
      },
      async: false,
    })
      .done(callback)
      .fail((res) => {
        alert('システムエラーが発生しました。');
        console.log(res);
      });
  }

  /**
   * 予約情報フォーム：変更処理
   * @param data 予約情報
   * @param callback 処理成功時のコールバック関数
   */
  static updateReserve(data, callback) {
    // TODO ★データレイアウトの加工
    // data['start_time'] = data['date'] + ' ' + data['start_time'];
    // data['end_time'] = data['date'] + ' ' + data['end_time'];
    $.ajax({
      url: SERVER_URL + '/reserve',
      type: 'PUT',
      dataType: 'json',
      data: {
        id: data['id'],
        user_nm: data['user_nm'],
        dept_nm: data['dept_nm'],
        room_id: data['room_id'],
        reason: data['reason'],
        date: data['date'],
        start_time: data['start_time'],
        end_time: data['end_time'],
        password: data['password'],
      },
      async: false,
    })
      .done(callback)
      .fail((res) => {
        alert('システムエラーが発生しました。');
        console.log(res);
      });
  }

  /**
   * 予約情報の取消処理
   * @param callback 処理成功時のコールバック関数
   */
  static deleteReserve(id, password, callback) {
    $.ajax({
      url: SERVER_URL + '/reserve',
      type: 'DELETE',
      dataType: 'json',
      data: {
        id: id,
        password: password,
      },
      async: false,
    })
      .done(callback)
      .fail((res) => {
        alert('システムエラーが発生しました。');
        console.log(res);
      });
  }
}
