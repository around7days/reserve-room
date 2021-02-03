/**
 * 日次スケジュールクラス
 */
class ScheduleDailyClass {
  /**
   * コンストラクタ
   */
  constructor() {
    this.$schedule;
    this.dragFlg = false;
    this.dragRoomId;
    this.dragStartTime;
    this.dragEndTime;
    this.dropCallback;
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
          <tfoot class="thead-dark"></tfoot>
        </table>
      </div>
    `);

    // テーブル
    let $table = this.$schedule.find('.table');
    let $thead = $table.find('thead');
    let $tbody = $table.find('tbody');
    let $tfoot = $table.find('tfoot');

    // 会議室一覧の取得
    let roomList = ApiUtil.getRoomList();

    // ヘッダ行・フッタ行の生成
    {
      // tr行の生成
      let $tr = $('<tr>');

      // 時刻列の追加
      let $timeTd = $('<th>').addClass('time-row').text('時刻');
      $tr.append($timeTd);

      // 会議室列の追加
      roomList.forEach((room) => {
        let $roomTd = $('<th>').addClass('room-row').text(room['room_nm']);
        $tr.append($roomTd);
      });

      // ヘッダ行に追加
      $thead.append($tr.clone());
      // $tfoot.append($tr.clone());
    }

    // 明細行の生成
    {
      // スケジュール定義情報の取得
      let timeList = this.getTimeList();

      // 明細行（時刻行）の生成
      timeList.forEach((time) => {
        // tr行の生成
        let $tr = $('<tr>');

        // 時刻列の追加
        let $timeTd = $('<td>').addClass('table-light').text(time.format('HH:mm'));
        $tr.append($timeTd);

        // 会議室列の追加
        roomList.forEach((room) => {
          let cellId = this.getCellId(room['room_id'], time.format('HH:mm'));
          let data = {
            room_id: room['room_id'],
            time: time.format('HH:mm'),
          };
          let $roomTd = $('<td>').attr('id', cellId).attr('data-info', JSON.stringify(data));
          $tr.append($roomTd);
        });

        // 明細に設定
        $tbody.append($tr);
      });
    }

    // 明細行セルのイベント登録
    $tbody
      .find('tr td:not(.table-light)')
      .on('mousedown', this.doMousedown.bind(this))
      .on('mouseover', this.doMousemove.bind(this))
      .on('mouseup', this.doMouseup.bind(this));
    $tbody.on('mouseleave', this.doMouseleave.bind(this));
    $tbody.find('tr td.table-light').on('mouseover', this.doMouseleave.bind(this));

    return this;
  }

  /**
   * 画面表示処理
   * @param ele 表示対象
   * @returns 自身のクラス
   */
  render(ele) {
    $(ele).append(this.get());
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
   * 時間一覧の取得
   * @returns 時間一覧
   */
  getTimeList() {
    // スケジュール定義情報の取得
    let scheduleDefineJson = SETTING['schedule_define'];
    let startTime = moment(scheduleDefineJson['start_time'], 'HH:mm');
    let endTime = moment(scheduleDefineJson['end_time'], 'HH:mm');
    let interval = scheduleDefineJson['interval'];

    // 時間一覧の生成
    let timeList = [];
    let time = startTime;
    while (time < endTime) {
      timeList.push(time.clone());
      time = time.add(interval, 'm');
    }

    return timeList;
  }

  /**
   * 次の時間の取得
   * @param 時間
   * @returns 次の時間
   */
  getNextTime(time) {
    let scheduleDefineJson = SETTING['schedule_define'];
    let interval = scheduleDefineJson['interval'];
    return moment(time, 'HH:mm').add(interval, 'm');
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
   * セル範囲の背景色を変更
   * @param roomId 会議室ID
   * @param time 時刻
   */
  changeColorCellRange(roomId, startTime, endTime) {
    this.getTimeList().forEach((time) => {
      let $cell = this.getCell(roomId, time);
      if (time.isSameOrAfter(moment(startTime, 'HH:mm')) && time.isSameOrBefore(moment(endTime, 'HH:mm'))) {
        $cell.addClass('schedule-drag-color');
      } else {
        $cell.removeClass('schedule-drag-color');
      }
    });
  }

  /**
   * セル情報の取得
   * @param cell セル
   * @returns セル情報
   */
  getCellData(cell) {
    let data = $(cell).attr('data-info');
    if (!data) {
      return null;
    }
    return JSON.parse(data);
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

  /**
   * ドロップイベントのコールバックセット
   */
  setDropCallback(callback) {
    this.dropCallback = callback;
    return this;
  }

  /** Mousedown */
  doMousedown(event) {
    // console.log('doMousedown:' + $(event.target).attr('id'));
    let $target = $(event.target);

    this.dragFlg = true;
    let cellData = this.getCellData($target);
    if (cellData == null) {
      // TODO ★綺麗にする。
      this.doMouseleave(event);
      return;
    }
    this.dragRoomId = cellData['room_id'];
    this.dragStartTime = cellData['time'];
    this.dragEndTime = cellData['time'];
    this.changeColorCellRange(this.dragRoomId, this.dragStartTime, this.dragStartTime);
  }

  /** mousemove */
  doMousemove(event) {
    if (!this.dragFlg) {
      return;
    }
    // console.log('doMousemove:' + $(event.target).attr('id'));
    let $target = $(event.target);
    let cellData = this.getCellData($target);
    if (cellData == null) {
      // TODO ★綺麗にする。
      this.doMouseleave(event);
      return;
    }

    this.dragEndTime = cellData['time'];
    this.changeColorCellRange(this.dragRoomId, this.dragStartTime, this.dragEndTime);
  }

  /** mouseup */
  doMouseup(event) {
    if (!this.dragFlg) {
      return;
    }
    // console.log('doMouseup:' + $(event.target).attr('id'));
    this.dragFlg = false;
    this.changeColorCellRange(this.dragRoomId, null, null);

    // データセット
    let data = {
      room_id: this.dragRoomId,
      start_time: this.dragStartTime,
      end_time: this.getNextTime(this.dragEndTime).format('HH:mm'),
    };
    // コールバック実行
    this.dropCallback(data);
  }

  /** mouseleave */
  doMouseleave(event) {
    if (!this.dragFlg) {
      return;
    }
    // console.log('doMouseleave:' + $(event.target).attr('id'));
    this.dragFlg = false;
    this.changeColorCellRange(this.dragRoomId, null, null);
  }
}

const scheduleDaily = new ScheduleDailyClass();
