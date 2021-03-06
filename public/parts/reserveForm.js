/**
 * 予約情報フォームクラス
 */
class reserveFormClass {
  /**
   * コンストラクタ
   */
  constructor() {
    this.$form = null;
    this.showRegist; // true:登録モード false:更新モード
    this.successCallback;
  }
  /**
   * 予約情報フォームの生成
   * @returns 自身のクラス
   */
  create() {
    this.$form = $(`
      <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">予約情報</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div data-id="warningMessage"></div>
              <div>
                <div class="form-row">
                  <input type="hidden" data-id="id" />
                  <div class="form-group col-4">
                    <label class="col-form-label">氏名</label>
                    <input type="text" class="form-control" data-id="userNm" required />
                  </div>
                  <div class="form-group col">
                    <label class="col-form-label">部署</label>
                    <input type="text" class="form-control" data-id="deptNm" required />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group col-auto">
                    <label class="col-form-label">会議室</label>
                    <select class="form-control" data-id="roomId" required ></select>
                  </div>
                  <div class="form-group col">
                    <label class="col-form-label">利用用途</label>
                    <input type="text" class="form-control" data-id="reason" required />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group col-auto">
                    <label class="col-form-label">日付</label>
                    <input type="date" class="form-control" data-id="date" required />
                  </div>
                  <div class="form-group col-auto">
                    <label class="col-form-label">開始時刻</label>
                    <select class="form-control" data-id="startTime" required ></select>
                  </div>
                  <div class="form-group col-auto">
                    <label class="col-form-label">終了時刻</label>
                    <select class="form-control" data-id="endTime" required ></select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group col-4">
                    <label class="col-form-label">パスワード</label>
                    <input type="text" class="form-control" data-id="password" autocomplete="off" required />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" data-id="cancelBtn" class="btn btn-primary">取消</button>
              <button type="button" data-id="updateBtn" class="btn btn-primary">変更</button>
              <button type="button" data-id="registBtn" class="btn btn-primary">登録</button>
              <button type="button" data-id="copyBtn" class="btn btn-primary">複写</button>
            </div>
          </div>
        </div>
      </div>
    `);

    // 会議室のリストボックス設定
    {
      let roomJson = ApiUtil.getRoomList();
      this.$form.find('[data-id=roomId]').append('<option>');
      roomJson.forEach((data) => {
        let $option = $('<option>').val(data['room_id']).text(data['room_nm']);
        this.$form.find('[data-id=roomId]').append($option);
      });
    }

    // 開始時刻・終了時刻のリストボックス設定
    {
      // スケジュール定義情報の取得
      let scheduleDefineJson = SETTING['schedule_define'];
      let startTime = moment(scheduleDefineJson['start_time'], 'HH:mm');
      let endTime = moment(scheduleDefineJson['end_time'], 'HH:mm');
      let interval = scheduleDefineJson['interval'];

      this.$form.find('[data-id=startTime]').append($('<option>'));
      this.$form.find('[data-id=endTime]').append($('<option>'));
      let addTime = startTime;
      while (addTime.isSameOrBefore(endTime)) {
        let $option = $('<option>').val(addTime.format('HH:mm')).text(addTime.format('HH:mm'));
        this.$form.find('[data-id=startTime]').append($option.clone());
        this.$form.find('[data-id=endTime]').append($option.clone());
        addTime = addTime.add(interval, 'm');
      }
    }

    // イベント設定：ボタン押下処理
    this.$form.find('[data-id=cancelBtn]').on('click', this.cancel.bind(this));
    this.$form.find('[data-id=updateBtn]').on('click', this.update.bind(this));
    this.$form.find('[data-id=registBtn]').on('click', this.regist.bind(this));
    this.$form.find('[data-id=copyBtn]').on('click', this.regist.bind(this));

    // イベント設定：初期表示処理（初期フォーカス設定）
    this.$form.on('shown.bs.modal', this.setBlankFocus.bind(this));

    // イベント設定：Enter押下処理
    this.$form.keypress((e) => {
      if (e.which == 13) {
        if (this.showRegist == true) {
          this.$form.find('[data-id=registBtn]').click();
        } else {
          this.$form.find('[data-id=updateBtn]').click();
        }
      }
    });

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
   * 予約情報フォームの取得
   * @returns 予約情報フォーム
   */
  get() {
    return this.$form;
  }

  /**
   * 個人情報をフォームから取得
   * @returns 個人情報
   */
  getData() {
    let data = {
      id: this.$form.find('[data-id=id]').val(),
      user_nm: this.$form.find('[data-id=userNm]').val(),
      dept_nm: this.$form.find('[data-id=deptNm]').val(),
      room_id: this.$form.find('[data-id=roomId]').val(),
      reason: this.$form.find('[data-id=reason]').val(),
      date: this.$form.find('[data-id=date]').val(),
      start_time: this.$form.find('[data-id=startTime]').val(),
      end_time: this.$form.find('[data-id=endTime]').val(),
      password: this.$form.find('[data-id=password]').val(),
    };
    return data;
  }

  /**
   * 個人情報をフォームにセット
   * @param data 個人情報
   * @returns 自身のクラス
   */
  setData(data) {
    this.$form.find('[data-id=id]').val(data['id']);
    this.$form.find('[data-id=userNm]').val(data['user_nm']);
    this.$form.find('[data-id=deptNm]').val(data['dept_nm']);
    this.$form.find('[data-id=roomId]').val(data['room_id']);
    this.$form.find('[data-id=reason]').val(data['reason']);
    this.$form.find('[data-id=date]').val(data['date']);
    this.$form.find('[data-id=startTime]').val(data['start_time']);
    this.$form.find('[data-id=endTime]').val(data['end_time']);
    this.$form.find('[data-id=password]').val(data['password']);
    return this;
  }

  /**
   * 登録/複写/更新/削除処理成功時のコールバック関数をセット
   * @param callback コールバック関数
   * @returns 自身のクラス
   */
  setSuccessCallback(callback) {
    this.successCallback = callback;
    return this;
  }

  /**
   * 表示（予約登録モード）
   * @returns 自身のクラス
   */
  showNew() {
    this.$form.find('[data-id=cancelBtn]').hide();
    this.$form.find('[data-id=updateBtn]').hide();
    this.$form.find('[data-id=registBtn]').show();
    this.$form.find('[data-id=copyBtn]').hide();
    this.showRegist = true;
    this.setMessage(null);
    this.$form.modal('show');
    return this;
  }

  /**
   * 表示（予約変更モード）
   * @returns 自身のクラス
   */
  showUpdate() {
    this.$form.find('[data-id=cancelBtn]').show();
    this.$form.find('[data-id=updateBtn]').show();
    this.$form.find('[data-id=registBtn]').hide();
    this.$form.find('[data-id=copyBtn]').show();
    this.showRegist = false;
    this.setMessage(null);
    this.$form.modal('show');
    return this;
  }

  /**
   * 非表示
   * @returns 自身のクラス
   */
  hide() {
    this.$form.modal('hide');
    return this;
  }

  /**
   * 値が空白の項目にフォーカスを合わせる
   * @returns 自身のクラス
   */
  setBlankFocus() {
    // TODO 手抜きでtextのみ
    let ele = this.$form.find('input[type=text]').each((index, element) => {
      if ($(element).val() == '') {
        $(element).focus();
        return false;
      }
    });
  }

  /**
   * 予約情報の登録/複写処理
   * @returns 自身のクラス
   */
  regist() {
    let data = this.getData();
    // TODO ★データレイアウトの加工
    data['start_time'] = data['date'] + ' ' + data['start_time'];
    data['end_time'] = data['date'] + ' ' + data['end_time'];

    ApiUtil.registReserve(data, this.execCallback.bind(this));
    return this;
  }

  /**
   * 予約情報の変更処理
   * @returns 自身のクラス
   */
  update() {
    let data = this.getData();
    // TODO ★データレイアウトの加工
    data['start_time'] = data['date'] + ' ' + data['start_time'];
    data['end_time'] = data['date'] + ' ' + data['end_time'];

    ApiUtil.updateReserve(data, this.execCallback.bind(this));
    return this;
  }

  /**
   * 予約情報の取消処理
   * @returns 自身のクラス
   */
  cancel() {
    let data = this.getData();
    let id = data['id'];
    let password = data['password'];
    ApiUtil.deleteReserve(id, password, this.execCallback.bind(this));
    return this;
  }

  /**
   * 予約情報の登録/複写/変更/取消後のコールバック処理
   * @param res 処理結果
   */
  execCallback(res) {
    // エラー時はエラーメッセージを表示
    // 正常時は画面をクローズして指定されたコールバック関数の実行
    if (res['errors']) {
      this.setMessage(res['errors']);
      return;
    } else {
      this.successCallback();
      this.hide();
    }
  }

  /**
   * 予約情報フォームの表示設定：エラーメッセージ表示
   * @returns 自身のクラス
   */
  setMessage(errors) {
    let $msgArea = this.$form.find('[data-id=warningMessage]');
    // 初期化
    $msgArea.html('');
    if (errors == null) {
      return this;
    }

    // エラーメッセージのセット
    let $ul = $('<ul>');
    errors.forEach((error) => {
      let $li = $('<li>').text(error.msg);
      $ul.append($li);
    });
    $msgArea.append($ul).addClass('text-danger');
    return this;
  }
}

const rsvForm = new reserveFormClass();
