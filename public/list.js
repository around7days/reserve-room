$(function () {
  /** datatable */
  let dataTable;

  /** 初期処理 */
  init();

  /**
   * 初期処理
   */
  function init() {
    // サイドエリアの生成
    createSideArea();
    // スケジュールの生成
    createSchedule();
    // 予情報フォームの生成
    createReserveForm();
  }

  /**
   * サイドエリアの生成
   */
  function createSideArea() {
    let $ele = `
      <!-- 表示切替 -->
      <div>
        <div class="d-inline">
          <h5 class="d-inline pr-2">表示切替</h5>
          <a class="btn btn-outline-primary btn-sm" href="main.html">切替</a>
        </div>
      </div>
      <div class="pt-4"></div>
    `;
    $('#sideArea').append($ele);
  }

  /**
   * スケジュールの生成
   */
  function createSchedule() {
    // 当日以降の予約情報を全て取得
    let startDate = new moment();
    let reserveList = ApiUtil.getReserveListAll(startDate);
    // TODO ★データレイアウトの加工
    reserveList.forEach((data) => {
      data['date'] =
        moment(data['start_time']).format('YYYY/MM/DD') +
        ' ' +
        moment(data['start_time']).format('HH:mm') +
        '-' +
        moment(data['end_time']).format('HH:mm');
    });

    // テーブル要素の生成
    let $ele = `
      <table class="table table-sm table-bordered table-hover">
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
    `;
    $('#reserveListArea').append($ele);

    // DataTables設定
    $('#reserveListArea table').DataTable({
      data: reserveList,
      dom: '<B>frtip',
      buttons: ['copy', 'csv', 'excel'],
      paging: true,
      pageLength: 20,
      searching: true,
      ordering: true,
      order: [
        [1, 'desc'],
        [2, 'asc'],
      ],
      info: true,
      // stateSave: true,
      columns: [{ data: 'room_nm' }, { data: 'date' }, { data: 'user_nm' }, { data: 'dept_nm' }, { data: 'reason' }],
      // 行に全情報を埋め込む
      createdRow: function (row, data, dataIndex) {
        $(row).attr('data-info', JSON.stringify(data)).css('cursor', 'pointer');
      },
    });
  }

  /**
   * 予約情報フォームの生成
   */
  function createReserveForm() {
    // 登録/更新/削除処理後に実行するコールバック関数の作成
    let callback = function () {
      let targetDate = getTargetDate();
      createCardAll(targetDate);
    };
    // フォーム生成
    rsvForm.create().setSuccessCallback(callback).render($('#reserveFormArea'));
  }

  /**
   * 対象日付表示
   * @param targetDate 対象日付
   */
  function setTargetDate(targetDate) {
    $('#targetDate').val(targetDate.format('YYYY-MM-DD'));
  }

  /**
   * 対象日付取得
   * @returns 対象日付
   */
  function getTargetDate() {
    return moment($('#targetDate').val());
  }

  /**
   * DataTables設定
   */
  function setupDataTables() {}

  /**
   * 自身か判定
   * @param userNm 氏名
   * @param deptNm 部署名
   * @returns 結果[true:自身]
   */
  function isSelfUser(userNm, deptNm) {
    // 氏名・部署が一致する場合は自身と判断
    let userSetting = usForm.getDataByStorage();
    if (userSetting['def_user_nm'] == userNm && userSetting['def_dept_nm'] == deptNm) {
      return true;
    }
    return false;
  }
});
