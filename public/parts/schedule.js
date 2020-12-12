/**
 * スケジュールクラス
 */
class ScheduleClass {
  /**
   * コンストラクタ
   */
  constructor() {
    this.$schedule;
  }

  /**
   * スケジュールの生成
   * @returns 自身のクラス
   */
  create() {
    this.$schedule = $(`
      <div class="d-inline">
        <h5 class="d-inline" data-id="dispDate"></h5>
      </div>
      <div class="pt-2"></div>
      <div>
        <table class="table table-sm table-bordered schedule-table">
          <thead class="thead-dark"></thead>
          <tbody></tbody>
        </table>
      </div>
    `);

    // テーブル
    let $table = this.$schedule.find('.table');

    // 会議室一覧の取得
    let roomList = ApiUtil.getRoomList();

    // ヘッダ行の生成
    {
      let $thead = $table.find('thead');

      // tr行の生成
      let $tr = $('<tr>');

      // 時刻列の追加
      let $timeTd = $('<th>').css('width', '60px').text('時刻');
      $tr.append($timeTd);

      // 会議室列の追加
      roomList.forEach((room) => {
        let $roomTd = $('<th>').css('width', '100px').text(room['room_nm']);
        $tr.append($roomTd);
      });

      // ヘッダ行に追加
      $thead.append($tr);
    }

    // 明細行の生成
    {
      let $tbody = $table.find('tbody');

      // スケジュール定義情報の取得
      let scheduleDefineJson = ApiUtil.getScheduleDefine();
      let startTime = moment(scheduleDefineJson['start_time'], 'HH:mm');
      let endTime = moment(scheduleDefineJson['end_time'], 'HH:mm');
      let interval = scheduleDefineJson['interval'];

      // 明細行（時刻行）の生成
      let time = startTime;
      while (time < endTime) {
        // tr行の生成
        let $tr = $('<tr>');

        // 時刻列の追加
        let $timeTd = $('<td>').addClass('table-light').text(time.format('HH:mm'));
        $tr.append($timeTd);

        // 会議室列の追加
        roomList.forEach((room) => {
          let cellId = this.getCellId(room['room_id'], time.format('HH:mm'));
          let $roomTd = $('<td>').attr('id', cellId);
          $tr.append($roomTd);
        });

        // 明細に設定
        $tbody.append($tr);

        // インターバル時刻の追加
        time = time.add(interval, 'm');
      }
    }

    return this;
  }

  /**
   * スケジュールの取得
   * @returns スケジュール
   */
  get() {
    return this.$schedule;
  }

  /**
   * 日付の設定
   * @date 日付
   * @returns 自身のクラス
   */
  setDate(date) {
    let dispDate = date.format('YYYY年MM月DD日（ddd）');
    this.$schedule.find('[data-id=dispDate]').text(dispDate);
    return this;
  }

  /**
   * セルIDの取得
   * @param roomId 会議室ID
   * @param time 時刻
   * @returns セルID
   */
  getCellId(roomId, time) {
    return roomId + '_' + moment(time, 'HH:mm').format('HHmm');
  }

  /**
   * セルの取得
   * @param roomId 会議室ID
   * @param time 時刻
   * @returns セル
   */
  getCell(roomId, time) {
    let id = this.getCellId(roomId, time);
    return this.$schedule.find('#' + id);
  }

  /**
   * セル範囲を取得
   * @param roomId 会議室ID
   * @param startTime 開始時刻
   * @param endTime 終了時刻
   */
  getCellSize(roomId, startTime, endTime) {
    // 対象オブジェクトの取得
    let $startTd = this.getCell(roomId, startTime);
    let $endTd = this.getCell(roomId, endTime);

    // カードサイズの設定
    let width = $startTd.width();
    let top = $startTd.offset().top;
    let bottom;
    if ($endTd.length > 0) {
      bottom = $endTd.offset().top + $endTd.height() - $endTd.outerHeight(true);
    } else {
      let $tbody = this.$schedule.find('tbody');
      bottom = $tbody.offset().top + $tbody.height() + $startTd.height() - $startTd.outerHeight(true);
    }
    let height = bottom - top;

    let size = {
      width: width,
      height: height,
    };
    return size;
  }
}

const schedule = new ScheduleClass();
