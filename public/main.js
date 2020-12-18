$(function () {
  /** 初期処理 */
  init();

  /** 新規予約ボタン押下 */
  $('#reserveNewBtn').on('click', showReserveFormNew);

  /** 個人設定ボタン押下 */
  $('#userSettingBtn').on('click', showUserSettingForm);

  /**
   * 初期処理
   */
  function init() {
    // 当日日付の取得
    let sysdate = new moment();
    // 日付設定
    setTargetDate(sysdate);
    // カレンダー表示
    createCalender();
    // 予情報フォームの生成
    createReserveForm();
    // 個人情報設定フォームの生成
    createUserSettingForm();
    // スケジュール生成
    createSchedule();
    // 予約カードの作成
    createCardAll(sysdate);
  }

  /**
   * カレンダー作成
   */
  function createCalender() {
    $('#datepicker').datepicker({
      firstDay: 1,
      dateFormat: 'yy-mm-dd',
      showOtherMonths: true,
      selectOtherMonths: true,
      minDate: 0,
      onSelect: function (dateText, inst) {
        let date = moment(dateText);
        // 日付の再設定
        setTargetDate(date);
        schedule.setDate(date);
        // 予約カードの再作成
        createCardAll(date);
      },
    });
    $('#datepicker') //
      .css('transform', 'scale(0.9, 0.9)')
      .css('margin-top', '-10px')
      .css('margin-left', '-30px');
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
   * 個人情報設定フォームの生成
   */
  function createUserSettingForm() {
    usForm.create().render($('#userSettingFormArea'));
  }

  /**
   * スケジュール作成
   */
  function createSchedule() {
    let targetDate = getTargetDate();

    // 明細行のドロップ処理イベントの生成
    let callback = function (data) {
      if (moment(data['start_time'], 'HH:mm').isBefore(moment(data['end_time'], 'HH:mm'))) {
        showReserveFormNew(data);
      }
    };

    // 画面描画
    schedule.create().setDate(targetDate).setDropCallback(callback).render($('#scheduleArea'));
  }

  /**
   * 個人情報設定フォームの表示
   */
  function showUserSettingForm() {
    let data = usForm.getDataByStorage();
    usForm.setDataByForm(data).show();
  }

  /**
   * 予約カードの作成（全予約カードの再作成）
   * @param targetDate 対象日付
   */
  function createCardAll(targetDate) {
    // 予約カードが存在する場合は全て削除
    reserveCard.removeAll();
    // 予約情報一覧の取得
    let reserveList = ApiUtil.getReserveList(targetDate);
    // TODO ★データレイアウトの加工
    reserveList.forEach((data) => {
      data['date'] = moment(data['start_time']).format('YYYY-MM-DD');
      data['start_time'] = moment(data['start_time']).format('HH:mm');
      data['end_time'] = moment(data['end_time']).format('HH:mm');
    });
    // 予約情報からカードを作成してスケジュールにセット
    reserveList.forEach(createCard);
  }

  /**
   * 予約カードの作成
   * @param data 予約情報 {room_id, user_nm, dept_nm, start_time, end_time, reason}
   * @returns 予約カード
   */
  function createCard(data) {
    try {
      // 予約カードサイズの生成
      let size = schedule.getCellSize(data['room_id'], data['start_time'], data['end_time']);

      // 予約カードの表示位置を取得
      let $target = schedule.getCell(data['room_id'], data['start_time']);

      // 予約カードの色を生成
      let isSelfUserFlg = isSelfUser(data['user_nm'], data['dept_nm']);

      // 予約カードのクリックイベントを生成
      let clickEvent = function () {
        // 予約情報フォームの表示
        let data = reserveCard.set(this).getData();
        if (isSelfUser(data['user_nm'], data['dept_nm'])) {
          // 氏名・部署が一致する場合のみデフォルトパスワードを設定
          let userSetting = usForm.getDataByStorage();
          data['password'] = userSetting['def_password'];
        }
        rsvForm.setData(data).showUpdate();
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

      // 作成したカード情報を返却
      return $card;
    } catch (e) {
      alert('正しく表示出来ない予約情報が存在します。システム管理者に問い合わせください。\r\n' + JSON.stringify(data));
      console.log('エラー予約情報：' + JSON.stringify(data));
      console.log('エラー内容：' + e);
    }
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
