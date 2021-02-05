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
      <div class="d-inline">
        <h5 class="d-inline" data-id="dispDate"></h5>
      </div>
      <div class="pt-2"></div>
      <div>
        <table class="table table-sm table-bordered table-hover" style="width:100%">
          <thead class="thead-dark">
            <tr>
              <th>会議室</th>
              <th>日付</th>
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
   * スケジュール情報の反映
   * @date スケジュール情報一覧
   * @returns 自身のクラス
   */
  setDataTables(dataList, clickFunction) {
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
      order: [
        [0, 'asc'],
        [1, 'asc'],
      ],
      info: true,
      // stateSave: true,
      columns: [
        { data: 'room_nm' }, //
        { data: 'date_range' },
        { data: 'user_nm' },
        { data: 'dept_nm' },
        { data: 'reason' },
      ],
      // 行単位の個別設定
      createdRow: function (row, data, dataIndex) {
        $(row)
          .attr('data-info', JSON.stringify(data)) // データ埋め込み
          .css('cursor', 'pointer') // ポインタ設定
          .on('click', function () {
            // クリックイベント
            let data = JSON.parse($(this).attr('data-info'));
            clickFunction(data);
          });
      },
    });

    return this;
  }

  /**
   * 行情報の取得
   * @param row 行
   * @returns 行情報
   */
  getRowData(row) {
    let data = $(row).attr('data-info');
    if (!data) {
      return null;
    }
    return JSON.parse(data);
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
