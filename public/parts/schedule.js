/**
 * スケジュールクラス
 */
class ScheduleTable {
  /**
   * コンストラクタ
   */
  constructor() {
    this.$schedule = null;
    this.successCallback;
  }
  /**
   * スケジュールの生成
   * @returns 自身のクラス
   */
  create() {
    this.$schedule = $(`
      <div class="d-inline">
        <h5 class="d-inline" data-id="dateNm"></h5>
      </div>
      <div>
        <table class="table table-sm table-bordered">
          <thead class="thead-dark"></thead>
          <tbody></tbody>
        </table>
      </div>
    `);

    // テーブル
    let $table = this.$schedule.find('.table');

    // 会議室一覧の取得
    let roomJson = ApiUtil.getRoomList();

    // スケジュール定義情報の取得
    let scheduleDefineJson = ApiUtil.getScheduleDefine();
    let startTime = moment(scheduleDefineJson['start_time'], 'HH:mm');
    let endTime = moment(scheduleDefineJson['end_time'], 'HH:mm');
    let interval = scheduleDefineJson['interval'];

    // ヘッダ行（会議室行）の生成
    {
      // tr行の生成
      let $tr = $('<tr>');

      // 時刻列の追加
      let $timeTd = $('<th>').css('width', '60px').text('時刻');
      $tr.append($timeTd);

      // 会議室列の追加
      roomJson.forEach((data) => {
        $roomTd = $('<th>').css('width', '100px').text(data['room_nm']);
        $tr.append($roomTd);
      });

      // ヘッダ行に追加
      $table.find('thead').append($tr);
    }

    {
      // 明細行（時刻行）の生成
      let time = startTime;
      while (time < endTime) {
        // tr行の生成
        let $tr = $('<tr>');

        // 時刻列の追加
        let $timeTd = $('<td>').addClass('table-light').text(time.format('HH:mm'));
        $tr.append($timeTd);

        // 会議室列の追加
        roomJson.forEach((data) => {
          let cellId = getCellId(data['room_id'], time.format('HH:mm'));
          let $cellId = $('<td>').attr('id', cellId);
          $tr.append($cellId);
        });

        // 明細に設定
        $table.find('tbody').append($tr);

        // インターバル時刻の追加
        time = time.add(interval, 'm');
      }
    }

    return this;
  }

  /**
   * セルIDの取得
   * @param roomId
   * @param time
   */
  getCellId(roomId, time) {
    return roomId + '_' + moment(time, 'HH:mm').format('HHmm');
  }

  /**
   * 予約情報フォームの取得
   * @returns 予約情報フォーム
   */
  get() {
    return this.$form;
  }

  /**
   * 個人情報をフォームから取得
   * @returns 個人情報
   */
  getData() {
    let data = {
      id: this.$form.find('[data-id=id]').val(),
      user_nm: this.$form.find('[data-id=userNm]').val(),
      dept_nm: this.$form.find('[data-id=deptNm]').val(),
      room_id: this.$form.find('[data-id=roomId]').val(),
      reason: this.$form.find('[data-id=reason]').val(),
      date: this.$form.find('[data-id=date]').val(),
      start_time: this.$form.find('[data-id=startTime]').val(),
      end_time: this.$form.find('[data-id=endTime]').val(),
      password: this.$form.find('[data-id=password]').val(),
    };
    return data;
  }

  /**
   * 個人情報をフォームにセット
   * @param data 個人情報
   * @returns 自身のクラス
   */
  setData(data) {
    this.$form.find('[data-id=id]').val(data['id']);
    this.$form.find('[data-id=userNm]').val(data['user_nm']);
    this.$form.find('[data-id=deptNm]').val(data['dept_nm']);
    this.$form.find('[data-id=roomId]').val(data['room_id']);
    this.$form.find('[data-id=reason]').val(data['reason']);
    this.$form.find('[data-id=date]').val(data['date']);
    this.$form.find('[data-id=startTime]').val(data['start_time']);
    this.$form.find('[data-id=endTime]').val(data['end_time']);
    this.$form.find('[data-id=password]').val(data['password']);
    return this;
  }

  /**
   * 登録/複写/更新/削除処理成功時のコールバック関数をセット
   * @param callback コールバック関数
   * @returns 自身のクラス
   */
  setSuccessCallback(callback) {
    this.successCallback = callback;
    return this;
  }

  /**
   * 表示（予約登録モード）
   * @returns 自身のクラス
   */
  showNew() {
    $('[data-id=cancelBtn]').addClass('display-none');
    $('[data-id=updateBtn]').addClass('display-none');
    $('[data-id=registBtn]').removeClass('display-none');
    $('[data-id=copyBtn]').addClass('display-none');
    this.setMessage(null);
    this.$form.modal('show');
    return this;
  }

  /**
   * 表示（予約変更モード）
   * @returns 自身のクラス
   */
  showUpdate() {
    $('[data-id=cancelBtn]').removeClass('display-none');
    $('[data-id=updateBtn]').removeClass('display-none');
    $('[data-id=registBtn]').addClass('display-none');
    $('[data-id=copyBtn]').removeClass('display-none');
    this.setMessage(null);
    this.$form.modal('show');
    return this;
  }

  /**
   * 非表示
   * @returns 自身のクラス
   */
  hide() {
    this.$form.modal('hide');
    return this;
  }

  /**
   * 予約情報の登録/複写処理
   * @returns 自身のクラス
   */
  regist() {
    let data = this.getData();
    ApiUtil.registReserve(data, this.execCallback.bind(this));
    return this;
  }

  /**
   * 予約情報の変更処理
   * @returns 自身のクラス
   */
  update() {
    let data = this.getData();
    ApiUtil.updateReserve(data, this.execCallback.bind(this));
    return this;
  }

  /**
   * 予約情報の取消処理
   * @returns 自身のクラス
   */
  cancel() {
    let data = this.getData();
    let id = data['id'];
    let password = data['password'];
    ApiUtil.deleteReserve(id, password, this.execCallback.bind(this));
    return this;
  }

  /**
   * 予約情報の登録/複写/変更/取消後のコールバック処理
   * @param res 処理結果
   */
  execCallback(res) {
    // エラー時はエラーメッセージを表示
    // 正常時は画面をクローズして指定されたコールバック関数の実行
    if (res['errors']) {
      this.setMessage(res['errors']);
      return;
    } else {
      this.hide();
      this.successCallback();
    }
  }

  /**
   * 予約情報フォームの表示設定：エラーメッセージ表示
   * @returns 自身のクラス
   */
  setMessage(errors) {
    let $msgArea = this.$form.find('[data-id=warningMessage]');
    // 初期化
    $msgArea.html('');
    if (errors == null) {
      return this;
    }

    // エラーメッセージのセット
    let $ul = $('<ul>');
    errors.forEach((error) => {
      let $li = $('<li>').text(error.msg);
      $ul.append($li);
    });
    $msgArea.append($ul).addClass('text-danger');
    return this;
  }
}

const schedule = new ScheduleTable();
