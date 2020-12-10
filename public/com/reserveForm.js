/**
 * 予約情報フォームクラス
 */
class reserveForm {
  /**
   * コンストラクタ
   */
  constructor() {
    this.$form = null;
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
                    <input type="text" class="form-control" data-id="userNm" />
                  </div>
                  <div class="form-group col">
                    <label class="col-form-label">部署</label>
                    <input type="text" class="form-control" data-id="deptNm" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group col-auto">
                    <label class="col-form-label">会議室</label>
                    <select class="form-control" data-id="roomId"></select>
                  </div>
                  <div class="form-group col">
                    <label class="col-form-label">利用用途</label>
                    <input type="text" class="form-control" data-id="reason" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group col-auto">
                    <label class="col-form-label">日付</label>
                    <input type="date" class="form-control" data-id="date" />
                  </div>
                  <div class="form-group col-auto">
                    <label class="col-form-label">開始時刻</label>
                    <select class="form-control" data-id="startTime"></select>
                  </div>
                  <div class="form-group col-auto">
                    <label class="col-form-label">終了時刻</label>
                    <select class="form-control" data-id="endTime"></select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group col-4">
                    <label class="col-form-label">パスワード</label>
                    <input type="password" class="form-control" data-id="password" />
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
      def_user_nm: this.$form.find('[data-id=defUserNm]').val(),
      def_dept_nm: this.$form.find('[data-id=defDeptNm]').val(),
      def_password: this.$form.find('[data-id=defPassword]').val(),
    };
    return data;
  }

  /**
   * 個人情報をフォームにセット
   * @param data 個人情報
   * @returns 自身のクラス
   */
  setData(data) {
    this.$form.find('[data-id=defUserNm]').val(data['def_user_nm']);
    this.$form.find('[data-id=defDeptNm]').val(data['def_dept_nm']);
    this.$form.find('[data-id=defPassword]').val(data['def_password']);
    return this;
  }

  /**
   * 表示
   * @param data 個人情報
   */
  show() {
    this.$form.modal('show');
    return this;
  }

  /**
   * 非表示
   * @param data 個人情報
   */
  hide() {
    this.$form.modal('hide');
    return this;
  }

  /**
   * 予約情報の登録/複写処理
   */
  regist() {
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
  update() {
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
  cancel() {
    let id = $('#id').val();
    let password = $('#password').val();
    ApiUtil.deleteReserve(id, password, updateReserveCallback);
  }
}

const revForm = new reserveForm();
