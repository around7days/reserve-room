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

  /** 予約情報フォーム：登録/複写ボタン押下 */
  $('#registBtn, #copyBtn').on('click', execReserveRegist);

  /** 予約情報フォーム：変更ボタン押下 */
  $('#updateBtn').on('click', execReserveUpdate);

  /** 予約情報フォーム：取消ボタン押下 */
  $('#cancelBtn').on('click', execReserveCancel);

  /** カレンダー：クリック */
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

  /** 初期処理 */
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
  }

  /**
   * 個人情報設定フォームの生成
   */
  function createUserSetting() {
    let $userSettingForm = usForm.create().get();
    $('#userSettingArea').append($userSettingForm);
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
   * 予約情報フォームの生成
   */
  function createReserveForm() {
    // 会議室のリストボックス設定
    let roomJson = ApiUtil.getRoomList();
    $('#roomId').append($('<option>'));
    roomJson.forEach((data) => {
      let $option = $('<option>').val(data['room_id']).text(data['room_nm']);
      $('#roomId').append($option);
    });

    // スケジュール定義情報の取得
    let scheduleDefineJson = ApiUtil.getScheduleDefine();
    let startTime = moment(scheduleDefineJson['start_time'], 'HH:mm');
    let endTime = moment(scheduleDefineJson['end_time'], 'HH:mm');
    let interval = scheduleDefineJson['interval'];

    // 開始時刻・終了時刻のリストボックス設定
    $('#startTime').append($('<option>'));
    $('#endTime').append($('<option>'));
    let addTime = startTime;
    while (addTime.isSameOrBefore(endTime)) {
      let $option = $('<option>').val(addTime.format('HH:mm')).text(addTime.format('HH:mm'));
      $('#startTime').append($option.clone());
      $('#endTime').append($option.clone());
      addTime = addTime.add(interval, 'm');
    }
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
          let timeRoomId = data['room_id'] + '-' + time.format('YYYYMMDDHHmm'); // 会議室ID + "-" + 時刻(HHmm)
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
      let $startTd = $('#' + data['room_id'] + '-' + moment(data['start_time']).format('YYYYMMDDHHmm'));
      let $endTd = $('#' + data['room_id'] + '-' + moment(data['end_time']).format('YYYYMMDDHHmm'));

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
    // 個人設定の取得
    let userSetting = usForm.getDataByStorage();

    // 予約情報の初期値設定
    setReserveFormValidate(null);
    $('#id').val('');
    $('#userNm').val(userSetting['def_user_nm']);
    $('#deptNm').val(userSetting['def_dept_nm']);
    $('#roomId').val('');
    $('#reason').val('');
    $('#date').val(getTargetDate().format('YYYY-MM-DD'));
    $('#startTime').val('');
    $('#endTime').val('');
    $('#password').val(userSetting['def_password']);

    // ボタン設定
    $('#cancelBtn').addClass('display-none');
    $('#updateBtn').addClass('display-none');
    $('#registBtn').removeClass('display-none');
    $('#copyBtn').addClass('display-none');
  }

  /**
   * 予約カードクリックイベント
   */
  function clickReserveCard() {
    let data = new ReserveCard($(this)).getData();
    setReserveFormUpdate(data);
  }

  /**
   * 予約情報フォームの表示設定：予約変更
   */
  function setReserveFormUpdate(data) {
    // 個人設定の取得
    let userSetting = usForm.getDataByStorage();

    // 予約情報のセット
    setReserveFormValidate(null);
    $('#id').val(data['id']);
    $('#userNm').val(data['user_nm']);
    $('#deptNm').val(data['dept_nm']);
    $('#roomId').val(data['room_id']);
    $('#reason').val(data['reason']);
    $('#date').val(moment(data['start_time']).format('YYYY-MM-DD'));
    $('#startTime').val(moment(data['start_time']).format('HH:mm'));
    $('#endTime').val(moment(data['end_time']).format('HH:mm'));
    // 氏名・部署が一致する場合はデフォルトパスワードを設定
    if (userSetting['def_user_nm'] == data['user_nm'] && userSetting['def_dept_nm'] == data['dept_nm']) {
      $('#password').val(userSetting['def_password']);
    } else {
      $('#password').val('');
    }

    // ボタン設定
    $('#cancelBtn').removeClass('display-none');
    $('#updateBtn').removeClass('display-none');
    $('#registBtn').addClass('display-none');
    $('#copyBtn').removeClass('display-none');

    // モーダル表示
    $('#inputCardInfo').modal('show');
  }

  /**
   * 予約情報フォームの表示設定：エラーメッセージ表示
   */
  function setReserveFormValidate(errors) {
    // 初期化
    $('#warningMessage').html('');
    if (errors == null) {
      return;
    }

    // エラーメッセージのセット
    let $ol = $('<ul>');
    errors.forEach((error) => {
      let $li = $('<li>').text(error.msg);
      $ol.append($li);
    });
    $('#warningMessage').append($ol).addClass('text-danger');
  }

  /**
   * XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   * @param {*} data
   */
  function updateReserveCallback(data) {
    if (data['errors']) {
      // エラーメッセージの設定
      setReserveFormValidate(data['errors']);
      return;
    }

    // モーダルクローズ＋予約情報の再設定
    $('#inputCardInfo').modal('hide');
    createCardAll(getTargetDate());
  }

  /**
   * 予約情報の登録/複写処理
   */
  function execReserveRegist() {
    let data = {
      user_nm: $('#userNm').val(),
      dept_nm: $('#deptNm').val(),
      room_id: $('#roomId').val(),
      reason: $('#reason').val(),
      date: $('#date').val(),
      start_time: $('#startTime').val(),
      end_time: $('#endTime').val(),
      password: $('#password').val(),
    };
    ApiUtil.registReserve(data, updateReserveCallback);
  }

  /**
   * 予約情報の変更処理
   */
  function execReserveUpdate() {
    let data = {
      id: $('#id').val(),
      user_nm: $('#userNm').val(),
      dept_nm: $('#deptNm').val(),
      room_id: $('#roomId').val(),
      reason: $('#reason').val(),
      date: $('#date').val(),
      start_time: $('#startTime').val(),
      end_time: $('#endTime').val(),
      password: $('#password').val(),
    };
    ApiUtil.updateReserve(data, updateReserveCallback);
  }

  /**
   * 予約情報の取消処理
   */
  function execReserveCancel() {
    let id = $('#id').val();
    let password = $('#password').val();
    ApiUtil.deleteReserve(id, password, updateReserveCallback);
  }
});
