$(function () {
  /** サーバURL */
  // const SERVER_URL = '';
  const SERVER_URL = 'http://localhost:3000';
  // 当日日付の取得
  const SYSDATE = new moment();

  /** 初期処理 */
  init();

  /** 新規予約ボタン押下 */
  $('#newBtn').on('click', showReserveFormNew);

  /** 個人設定ボタン押下 */
  $('#userSettingBtn').on('click', showUserSettingForm);

  /** カレンダー：クリック */
  // -------------------------------------------------------------------
  // -------------------------------------------------------------------
  var dragFlg = false;
  var $dragCard;
  $('#scheduleTable tbody td').on('mousedown', doMousedown);
  // $('#scheduleTable tbody td').on('mousemove', mousemove);
  $('#scheduleTable tbody td').on('mouseover', mousemove);
  $('#scheduleTable tbody td').on('mouseup', doMouseup);

  function doMousedown() {
    dragFlg = true;
    console.log('down:' + $(this).attr('id'));
    let data = {
      room_id: 3,
      user_nm: '太郎',
      start_time: '2020-12-09 08:30:00',
      end_time: '2020-12-09 10:00:00',
      reason: 'テスト理由',
    };
    // $dragCard = createCard(data);
  }
  function mousemove() {
    if (!dragFlg) {
      return;
    }
    console.log('move:' + $(this).attr('id'));
  }
  function doMouseup() {
    dragFlg = false;
    // $dragCard.remove();
    console.log('up  :' + $(this).attr('id'));
  }
  // -------------------------------------------------------------------
  // -------------------------------------------------------------------

  /**
   * 初期処理
   */
  function init() {
    // 日付設定
    setTargetDate(SYSDATE);
    // カレンダー表示
    createCalender();
    // 予情報フォームの生成
    createReserveForm();
    // 個人情報設定フォームの生成
    createUserSettingForm();
    // スケジュール生成
    createSchedule();
    // 予約カードの作成
    createCardAll(SYSDATE);
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
        // 日付の再設定
        setTargetDate(moment(dateText));
        // 予約カードの再作成
        createCardAll(getTargetDate());
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
    var callback = function () {
      let targetDate = getTargetDate();
      createCardAll(targetDate);
    };
    // フォーム生成
    let $reserveForm = rsvForm.create().setSuccessCallback(callback).get();
    // 追加
    $('#reserveFormArea').append($reserveForm);
  }

  /**
   * 個人情報設定フォームの生成
   */
  function createUserSettingForm() {
    let $userSettingForm = usForm.create().get();
    $('#userSettingFormArea').append($userSettingForm);
  }

  /**
   * 個人情報設定フォームの表示
   */
  function showUserSettingForm() {
    let data = usForm.getDataByStorage();
    usForm.setDataByForm(data).show();
  }

  /**
   * 対象日付表示
   * @param targetDate 対象日付
   */
  function setTargetDate(targetDate) {
    $('#targetDate').val(targetDate.format('YYYY-MM-DD'));
    $('#targetDateNm').text(targetDate.format('YYYY年MM月DD日（ddd）'));
  }

  /**
   * 対象日付取得
   * @returns 対象日付
   */
  function getTargetDate() {
    return moment($('#targetDate').val());
  }

  /**
   * スケジュール作成
   */
  function createSchedule() {
    // スケジュールテーブル
    const $table = $('#scheduleTable');

    // 会議室一覧の取得
    let roomJson = ApiUtil.getRoomList();

    // スケジュール定義情報の取得
    let scheduleDefineJson = ApiUtil.getScheduleDefine();
    let startTime = moment(scheduleDefineJson['start_time'], 'HH:mm');
    let endTime = moment(scheduleDefineJson['end_time'], 'HH:mm');
    let interval = scheduleDefineJson['interval'];

    // 日付の取得
    let targetDate = getTargetDate();

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

      // ヘッダ業に追加
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
          let timeRoomId = getTimeRoomId(data['room_id'], targetDate.format('YYYY-MM-DD'), time.format('HH:mm'));
          let $timeRoomTd = $('<td>').attr('id', timeRoomId);
          $tr.append($timeRoomTd);
        });

        // 明細に設定
        $table.find('tbody').append($tr);

        // インターバル時刻の追加
        time = time.add(interval, 'm');
      }
    }
  }

  /**
   * 予約カードの作成（全予約カードの再作成）
   * @param targetDate 対象日付
   */
  function createCardAll(targetDate) {
    // 予約カードが存在する場合は全て削除
    $('div.reserve-card').each(function () {
      $(this).remove();
    });

    // 予約情報一覧の取得
    let reserveJson = ApiUtil.getReserveList(targetDate);

    // 予約情報からカードを作成してスケジュールにセット
    reserveJson.forEach(createCard);
  }

  /**
   * 予約カードの作成
   * @param data 予約情報 {room_id, user_nm, start_time, end_time, reason}
   * @returns 予約カード
   */
  function createCard(data) {
    try {
      // 対象オブジェクトの取得
      let $startTd = $('#' + getTimeRoomId(data['room_id'], data['date'], data['start_time']));
      let $endTd = $('#' + getTimeRoomId(data['room_id'], data['date'], data['end_time']));

      // カードサイズの設定
      let width = $startTd.width();
      let top = $startTd.offset().top;
      let bottom;
      if ($endTd.length > 0) {
        bottom = $endTd.offset().top + $endTd.height() - $endTd.outerHeight(true);
      } else {
        bottom =
          $('#scheduleTable tbody').offset().top + //
          $('#scheduleTable tbody').height() + //
          $startTd.height() - //
          $startTd.outerHeight(true);
      }
      let height = bottom - top;

      // 予約カード生成
      let $card = new ReserveCard() //
        .create()
        .setData(data)
        .setSize(width, height)
        .setEvent('click', clickReserveCard)
        .get();

      // スケジュールに追加
      $startTd.append($card);

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
   */
  function showReserveFormNew() {
    let userSetting = usForm.getDataByStorage();
    let data = {
      user_nm: userSetting['def_user_nm'],
      dept_nm: userSetting['def_dept_nm'],
      date: getTargetDate().format('YYYY-MM-DD'),
      password: userSetting['def_password'],
    };
    rsvForm.setData(data).showNew();
  }

  /**
   * 予約カードクリックイベント
   */
  function clickReserveCard() {
    let data = new ReserveCard($(this)).getData();
    let userSetting = usForm.getDataByStorage();

    // 氏名・部署が一致する場合のみデフォルトパスワードを設定
    if (
      userSetting['def_user_nm'] == data['user_nm'] || //
      userSetting['def_dept_nm'] == data['dept_nm']
    ) {
      data['password'] = userSetting['def_password'];
    }
    rsvForm.setData(data).showUpdate();
  }

  function getTimeRoomId(roomId, date, time) {
    return roomId + '_' + moment(date + ' ' + time).format('YYYYMMDD_HHmm');
  }
});
