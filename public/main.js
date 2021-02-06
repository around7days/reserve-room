$(function () {
  /** 画面リサイズ処理（カードサイズの再設定） */
  $(window).resize(() => resizeCardAll());

  /** 初期処理 */
  init();

  /**
   * 初期処理
   */
  function init() {
    // 当日日付の取得
    let sysdate = new moment();
    // 日付設定
    setTargetDate(sysdate);
    // サイドエリアの生成
    createSideArea();
    // 日次スケジュールの生成
    createScheduleDaily();
    // 一覧スケジュールの生成
    createScheduleList();
    // 予約カードの作成
    createCardAll();
    // 予情報フォームの生成
    createReserveForm();
    // 個人情報設定フォームの生成
    createUserSettingForm();
    // スケジュール表示エリアの設定
    switchScheduleDisp('daily');
  }

  /**
   * サイドエリアの生成
   */
  function createSideArea() {
    // サイドエリア生成
    let $ele = $(`
      <!-- カレンダー -->
      <div>
        <h5>カレンダー</h5>
        <div data-id="datepicker"></div>
      </div>
      <hr class="pt-1" />
      <!-- 個人設定 -->
      <div>
        <h5>個人設定</h5>
        <button id="userSettingBtn" class="btn btn-outline-primary btn-sm">表示</button>
      </div>
      <hr class="pt-1" />
      <!-- 表示切替 -->
      <div>
        <h5>表示切替</h5>
        <div class="btn-group btn-group-toggle" data-toggle="buttons">
          <label class="btn btn-outline-primary btn-sm active">
            <input type="radio" data-id="dispSwitch" value="daily" checked> 日次
          </label>
          <label class="btn btn-outline-primary btn-sm">
            <input type="radio" data-id="dispSwitch" value="list"> 一覧
          </label>
        </div>
      </div>
    `);
    $('#sideArea').append($ele);

    // カレンダー設定
    $ele.find('[data-id=datepicker]').datepicker({
      firstDay: 1,
      dateFormat: 'yy-mm-dd',
      showOtherMonths: true,
      selectOtherMonths: true,
      minDate: -30,
      onSelect: function (dateText, inst) {
        let date = moment(dateText);
        // 日付の再設定
        setTargetDate(date);
        // スケジュールのリフレッシュ
        refreshSchedule();
      },
    });

    // スケジュール表示切替設定
    $ele.find('[data-id=dispSwitch]').on('change', (e) => {
      switchScheduleDisp($(e.target).val());
    });

    // 個人設定ボタン押下イベント設定
    $('#userSettingBtn').on('click', showUserSettingForm);
  }

  /**
   * 予約情報フォームの生成
   */
  function createReserveForm() {
    // フォーム生成
    rsvForm
      .create()
      .setSuccessCallback(refreshSchedule) // 登録処理完了後にスケジュールのリフレッシュ
      .render($('#reserveFormArea'));
  }

  /**
   * 個人情報設定フォームの生成
   */
  function createUserSettingForm() {
    usForm.create().render($('#userSettingFormArea'));
  }

  /**
   * 日次スケジュール作成
   */
  function createScheduleDaily() {
    let targetDate = getTargetDate();

    // 明細行のドロップ処理イベントの生成
    let callback = function (data) {
      if (moment(data['start_time'], 'HH:mm').isBefore(moment(data['end_time'], 'HH:mm'))) {
        showReserveFormNew(data);
      }
    };

    // フォーム生成
    scheduleDaily
      .create()
      .setDate(targetDate) // 日付設定
      .setDropCallback(callback) // ドロップ時に予約情報フォームの表示
      .render($('#scheduleDailyArea'));
  }

  /**
   * 一覧スケジュール作成
   */
  function createScheduleList() {
    // 当日以降の予約情報を全て取得
    let today = new moment();
    let reserveList = ApiUtil.getReserveListAll(today);

    // データレイアウトの加工
    reserveList.forEach((data) => {
      data['date_range'] =
        moment(data['start_time']).format('YYYY/MM/DD') +
        ' ' +
        moment(data['start_time']).format('HH:mm') +
        '-' +
        moment(data['end_time']).format('HH:mm');
      data['date'] = moment(data['start_time']).format('YYYY-MM-DD');
      data['start_time'] = moment(data['start_time']).format('HH:mm');
      data['end_time'] = moment(data['end_time']).format('HH:mm');
    });

    // フォーム生成
    scheduleList.destory();
    scheduleList
      .create()
      .setDate(today) // 日付設定
      .setDataTables(reserveList, showReserveFormUpdate) // 行データ設定＋行クリック時に予約情報フォームの表示
      .render($('#scheduleListArea'));
  }

  /**
   * 個人情報設定フォームの表示
   */
  function showUserSettingForm() {
    let data = usForm.getDataByStorage();
    usForm.setDataByForm(data).show();
  }

  /**
   * 全予約カードの作成
   * @param targetDate 対象日付
   */
  function createCardAll(targetDate) {
    if (!targetDate) {
      targetDate = getTargetDate();
    }

    // 予約情報一覧の取得
    let reserveList = ApiUtil.getReserveList(targetDate);

    // データレイアウトの加工
    reserveList.forEach((data) => {
      data['date'] = moment(data['start_time']).format('YYYY-MM-DD');
      data['start_time'] = moment(data['start_time']).format('HH:mm');
      data['end_time'] = moment(data['end_time']).format('HH:mm');
    });

    // 予約情報からカードを作成してスケジュールにセット
    reserveCard.removeAll();
    reserveList.forEach((data) => createCard(data));
  }

  /**
   * 予約カードの作成
   * @param data 予約情報 {room_id, user_nm, dept_nm, start_time, end_time, reason}
   * @returns 予約カード
   */
  function createCard(data) {
    try {
      // 予約カードサイズの生成
      let size = scheduleDaily.getCellSize(data['room_id'], data['start_time'], data['end_time']);

      // 予約カードの表示位置を取得
      let $target = scheduleDaily.getCell(data['room_id'], data['start_time']);

      // 予約カードの色を生成
      let isSelfUserFlg = isSelfUser(data['user_nm'], data['dept_nm']);

      // 予約カードのクリックイベントを生成
      let clickEvent = function () {
        // 予約情報フォームの表示
        let data = reserveCard.set(this).getData();
        showReserveFormUpdate(data);
      };

      // 予約カード生成
      let $card = reserveCard
        .create()
        .setData(data)
        .setSize(size['width'], size['height'])
        .setIsSelfUser(isSelfUserFlg)
        .setEvent('click', clickEvent)
        .render($target)
        .get();

      return $card;
    } catch (e) {
      alert('正しく表示出来ない予約情報が存在します。システム管理者に問い合わせください。\r\n' + JSON.stringify(data));
      console.log('エラー予約情報：' + JSON.stringify(data));
      console.log('エラー内容：' + e);
    }
  }

  /**
   * 予約カードのリサイズ（全予約カードの再作成）
   */
  function resizeCardAll() {
    let $cardList = reserveCard.getAll();
    $cardList.each((idx, ele) => {
      // 予約情報の取得
      let data = reserveCard.set($(ele)).getData();
      // 予約カードサイズの再設定
      let size = scheduleDaily.getCellSize(data['room_id'], data['start_time'], data['end_time']);
      reserveCard.setSize(size['width'], size['height']);
    });
  }

  /**
   * 予約情報フォームの表示処理：新規予約
   * @data 初期表示データ
   */
  function showReserveFormNew(data) {
    if (!data) {
      data = {};
    }
    let userSetting = usForm.getDataByStorage();
    data['user_nm'] = userSetting['def_user_nm'];
    data['dept_nm'] = userSetting['def_dept_nm'];
    data['date'] = getTargetDate().format('YYYY-MM-DD');
    data['password'] = userSetting['def_password'];
    rsvForm.setData(data).showNew();
  }

  /**
   * 予約情報フォームの表示処理：更新
   * @data 初期表示データ
   */
  function showReserveFormUpdate(data) {
    if (isSelfUser(data['user_nm'], data['dept_nm'])) {
      // 氏名・部署が一致する場合のみデフォルトパスワードを設定
      let userSetting = usForm.getDataByStorage();
      data['password'] = userSetting['def_password'];
    }
    rsvForm.setData(data).showUpdate();
  }

  /**
   * スケジュールのリフレッシュ
   */
  function refreshSchedule() {
    // 日次スケジュール
    if ($('#scheduleDailyArea').css('display') != 'none') {
      scheduleDaily.setDate(getTargetDate());
      createCardAll();
    }

    // 一覧スケジュール
    if ($('#scheduleListArea').css('display') != 'none') {
      scheduleList.setDate(getTargetDate());
      createScheduleList();
    }
  }

  /**
   * スケジュールの表示切替
   * @kbn daily/list
   */
  function switchScheduleDisp(kbn) {
    if (kbn == 'daily') {
      // 日次スケジュール表示
      $('#scheduleDailyArea').show();
      $('#scheduleListArea').hide();
    } else {
      // 一覧スケジュール表示
      $('#scheduleDailyArea').hide();
      $('#scheduleListArea').show();
    }
    // スケジュールのリフレッシュ
    refreshSchedule();
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
