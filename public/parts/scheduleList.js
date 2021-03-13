/**
 * 一覧スケジュールクラス
 */
class ScheduleListClass {
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
    // テーブル要素の生成
    this.$schedule = $(`
      <div class="pt-1">
        <h5>全予約情報</h5>
      </div>
      <div>
        <table class="table table-sm table-bordered table-hover" style="width:100%">
          <thead class="thead-dark">
            <tr>
              <th>日付</th>
              <th>会議室</th>
              <th>氏名</th>
              <th>部署</th>
              <th>利用用途</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `);
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
   * スケジュール情報の反映
   * @param date スケジュール情報一覧
   * @param rowClickCallback 行クリックイベント
   * @returns 自身のクラス
   */
  setDataTables(dataList, rowClickCallback) {
    // DataTables設定
    this.$schedule.find('table').DataTable({
      data: dataList,
      // dom: '<B>frtip',
      // buttons: ['copy', 'csv', 'excel'],
      dom: 'frtip',
      paging: true,
      pageLength: 20,
      searching: true,
      ordering: true,
      processing: true,
      // order: [[0, 'asc']],
      info: true,
      stateSave: true,
      stateSaveCallback: function (settings, data) {
        localStorage.setItem('schedule#DataTables', JSON.stringify(data));
      },
      stateLoadCallback: function (settings) {
        return JSON.parse(localStorage.getItem('schedule#DataTables'));
      },
      columns: [
        { data: 'date_range' }, //
        { data: 'room_nm' },
        { data: 'user_nm' },
        { data: 'dept_nm' },
        { data: 'reason' },
      ],
      // 行単位の個別設定
      createdRow: function (row, data, dataIndex) {
        $(row)
          .attr('data-info', JSON.stringify(data)) // データ埋め込み
          .css('cursor', 'pointer') // ポインタ設定
          .on('click', (event) => {
            // 行クリックイベント
            let data = JSON.parse($(event.currentTarget).attr('data-info'));
            rowClickCallback(data);
          });
      },
    });

    return this;
  }

  /**
   * スケジュールの破棄
   */
  destory() {
    if (this.$schedule != null) {
      this.$schedule.remove();
    }
  }
}

const scheduleList = new ScheduleListClass();
