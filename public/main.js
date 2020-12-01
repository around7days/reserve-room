$(function () {
  /** サーバURL */
  const SERVER_URL = '';
  // 当日日付の取得
  const SYSDATE = new moment();

  /**
   * 初期処理
   */
  {
    // 日付設定
    setTargetDate(SYSDATE);

    // カレンダー表示
    createCalender();

    // 予情報フォームの生成
    createReserveForm();

    // スケジュール生成
    createSchedule();

    // 予約カードの作成
    createCard(SYSDATE);
  }

  /**
   * 予約情報フォーム：登録/複写ボタン押下
   */
  $('#registBtn, #copyBtn').on('click', function () {
    execRegist();
  });

  /**
   * 新規予約ボタン押下
   */
  $('#newBtn').on('click', function () {
    // 予約情報フォームの表示設定：新規予約
    setReserveFormNew();
  });

  /**
   * 予約情報フォーム：変更ボタン押下
   */
  $('#updateBtn').on('click', function () {
    execUpdate();
  });

  /**
   * 予約情報フォーム：取消ボタン押下
   */
  $('#cancelBtn').on('click', function () {
    execCancel();
  });

  /**
   * 個人設定ボタン押下
   */
  $('#userSettingBtn').on('click', function () {
    setUserSettingValue();
  });

  /**
   * 個人設定フォーム：保存ボタン押下
   */
  $('#saveBtn').on('click', function () {
    saveUserSetting();
  });

  /**
   * 個人設定保存処理
   */
  function saveUserSetting() {
    // ローカルストレージに保存
    localStorage.setItem('def_user_nm', $('#defUserNm').val());
    localStorage.setItem('def_dept_nm', $('#defDeptNm').val());
    localStorage.setItem('def_password', $('#defPassword').val());
    $('#userSettingInfo').modal('hide');
  }

  /**
   * 個人設定取得処理
   */
  function getUserSetting() {
    // ローカルストレージから取得
    let userSetting = {
      def_user_nm: localStorage.getItem('def_user_nm'),
      def_dept_nm: localStorage.getItem('def_dept_nm'),
      def_password: localStorage.getItem('def_password'),
    };
    return userSetting;
  }

  /**
   *個人設定モーダルの値設定
   */
  function setUserSettingValue() {
    $('#defUserNm').val(localStorage.getItem('def_user_nm'));
    $('#defDeptNm').val(localStorage.getItem('def_dept_nm'));
    $('#defPassword').val(localStorage.getItem('def_password'));
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
        createCard(getTargetDate());
      },
    });
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
    let roomJson = getRoomList();
    $('#roomId').append($('<option>'));
    roomJson.forEach((data) => {
      let $option = $('<option>').val(data['room_id']).text(data['room_nm']);
      $('#roomId').append($option);
    });

    // スケジュール定義情報の取得
    let scheduleDefineJson = getScheduleDefine();
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
    let roomJson = getRoomList();

    // スケジュール定義情報の取得
    let scheduleDefineJson = getScheduleDefine();
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
          let timeRoomId = data['room_id'] + '-' + time.format('HHmm'); // 会議室ID + "-" + 時刻(HHmm)
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
   * 予約カードの作成
   * @param targetDate 対象日付
   */
  function createCard(targetDate) {
    // 予約カードが存在する場合は削除
    $('div.reserve-card').each(function () {
      $(this).remove();
    });

    // 予約情報一覧の取得
    let reserveJson = getReserveInfoList(targetDate);

    // 予約情報からカードを作成してスケジュールにセット
    reserveJson.forEach((data) => {
      // 予約カードの作成
      let $card = $(`
                <div class="card reserve-card overflow-hidden" data-toggle="modal" data-target="#inputCardInfo">
                    <div class="card-body">
                        <p class="card-text"></p>
                    </div>
                </div>
            `);

      // 予約カードのラベル表示＋吹き出しを設定
      let cardText =
        data['user_nm'] +
        '<br>' +
        moment(data['start_time']).format('HH:mm') +
        '～' +
        moment(data['end_time']).format('HH:mm') +
        // + "<br>" + data['dept_nm']
        '<br>' +
        data['reason'];
      $card.find('.card-text').html(cardText);
      $card.attr('title', cardText);
      $card.tooltip({ html: true, trigger: 'hover' });
      // 予約カードに全情報を埋め込む
      $card.attr('data-reserve-info', JSON.stringify(data));

      // 予約カードのクリックイベントを設定（予約情報フォームの表示設定：予約変更）
      $card.on('click', function () {
        setReserveFormUpdate($card);
      });

      // 対象オブジェクトの取得
      let $startTd = $('#' + data['room_id'] + '-' + moment(data['start_time']).format('HHmm'));
      let $endTd = $('#' + data['room_id'] + '-' + moment(data['end_time']).format('HHmm'));

      // カードサイズの設定
      let width = $startTd.width();
      let top = $startTd.offset().top;
      let bottom = $endTd.offset().top + $endTd.height() - $endTd.outerHeight(true);
      let height = bottom - top;
      $card.css('width', width);
      $card.css('height', height);

      // スケジュールに追加
      $startTd.append($card);
    });
  }

  /**
   * スケジュール定義情報の取得
   * @returns スケジュール定義情報
   */
  function getScheduleDefine() {
    let jsonData;

    $.ajax({
      url: SERVER_URL + '/setting',
      type: 'GET',
      dataType: 'json',
      async: false,
    })
      .done((data) => {
        jsonData = data;
      })
      .fail((res) => {
        alert('設定情報の取得に失敗しました');
      });

    return jsonData['schedule_define'];
  }

  /**
   * 会議室一覧の取得
   * @returns 会議室一覧
   */
  function getRoomList() {
    let jsonData;
    $.ajax({
      url: SERVER_URL + '/rooms',
      type: 'GET',
      dataType: 'json',
      async: false,
    })
      .done((data) => {
        jsonData = data;
      })
      .fail((res) => {
        alert('会議室一覧の取得に失敗しました');
      });
    return jsonData;
  }

  /**
   * 予約情報をサーバから取得
   * @param targetDate 対象日付
   * @returns 予約情報（json）
   */
  function getReserveInfoList(targetDate) {
    let jsonData;
    $.ajax({
      url: SERVER_URL + '/reserves/search',
      type: 'GET',
      dataType: 'json',
      data: { date: targetDate.format('YYYY-MM-DD') },
      async: false,
    })
      .done((data) => {
        jsonData = data;
      })
      .fail((res) => {
        alert('予約情報一覧の取得に失敗しました');
      });
    return jsonData;
  }

  /**
   * 予約情報フォームの表示設定：新規予約
   */
  function setReserveFormNew() {
    // 個人設定の取得
    let userSetting = getUserSetting();

    // 予約情報の初期値設定
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
   * 予約情報フォームの表示設定：予約変更
   */
  function setReserveFormUpdate(ele) {
    // 個人設定の取得
    let userSetting = getUserSetting();

    // 予約情報のセット
    let data = JSON.parse($(ele).attr('data-reserve-info'));
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
  }

  /**
   * 予約情報フォーム：登録処理
   */
  function execRegist() {
    $.ajax({
      url: SERVER_URL + '/reserve',
      type: 'POST',
      dataType: 'json',
      data: {
        user_nm: $('#userNm').val(),
        dept_nm: $('#deptNm').val(),
        room_id: $('#roomId').val(),
        reason: $('#reason').val(),
        date: $('#date').val(),
        start_time: $('#startTime').val(),
        end_time: $('#endTime').val(),
        password: $('#password').val(),
      },
      async: false,
    })
      .done((data) => {
        // モーダルクローズ＋予約情報の再設定
        $('#inputCardInfo').modal('hide');
        createCard(getTargetDate());
      })
      .fail((res) => {
        alert('予約情報の登録に失敗しました');
      });
  }

  /**
   * 予約情報フォーム：変更処理
   */
  function execUpdate() {
    $.ajax({
      url: SERVER_URL + '/reserve',
      type: 'PUT',
      dataType: 'json',
      data: {
        id: $('#id').val(),
        user_nm: $('#userNm').val(),
        dept_nm: $('#deptNm').val(),
        room_id: $('#roomId').val(),
        reason: $('#reason').val(),
        date: $('#date').val(),
        start_time: $('#startTime').val(),
        end_time: $('#endTime').val(),
        password: $('#password').val(),
      },
      async: false,
    })
      .done((data) => {
        // モーダルクローズ＋予約情報の再設定
        $('#inputCardInfo').modal('hide');
        createCard(getTargetDate());
      })
      .fail((res) => {
        alert('予約情報の変更に失敗しました');
      });
  }

  /**
   * 予約情報フォーム：取消処理
   */
  function execCancel() {
    $.ajax({
      url: SERVER_URL + '/reserve',
      type: 'DELETE',
      dataType: 'json',
      data: {
        id: $('#id').val(),
        password: $('#password').val(),
      },
      async: false,
    })
      .done((data) => {
        // モーダルクローズ＋予約情報の再設定
        $('#inputCardInfo').modal('hide');
        createCard(getTargetDate());
      })
      .fail((res) => {
        alert('予約情報の取消に失敗しました');
      });
  }
});
