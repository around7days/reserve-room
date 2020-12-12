/**
 * 個人情報設定フォームクラス
 */
class UserSettingFormClass {
  /**
   * コンストラクタ
   */
  constructor() {
    this.$form = null;
  }

  /**
   * 個人情報設定フォームの生成
   * @returns 自身のクラス
   */
  create() {
    this.$form = $(`
      <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">個人設定</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div>
                <div class="form-row">
                  <div class="form-group col-4">
                    <label class="col-form-label">氏名</label>
                    <input type="text" class="form-control" data-id="defUserNm" />
                  </div>
                  <div class="form-group col">
                    <label class="col-form-label">部署</label>
                    <input type="text" class="form-control" data-id="defDeptNm" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group col-4">
                    <label class="col-form-label">パスワード</label>
                    <input type="password" class="form-control" data-id="defPassword" autocomplete="off" />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" data-id="saveBtn" class="btn btn-primary">保存</button>
            </div>
          </div>
        </div>
      </div>
    `);

    // 保存ボタンイベント設定
    this.$form.find('[data-id=saveBtn]').on('click', () => {
      let data = this.getDataByForm();
      this.saveDataByStorage(data).hide();
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
   * 個人情報設定フォームの取得
   * @returns 個人情報設定フォーム
   */
  get() {
    return this.$form;
  }

  /**
   * 個人情報をフォームから取得
   * @returns 個人情報
   */
  getDataByForm() {
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
  setDataByForm(data) {
    this.$form.find('[data-id=defUserNm]').val(data['def_user_nm']);
    this.$form.find('[data-id=defDeptNm]').val(data['def_dept_nm']);
    this.$form.find('[data-id=defPassword]').val(data['def_password']);
    return this;
  }

  /**
   * 個人情報をローカルストレージに保存
   * @param data 個人情報
   * @returns 自身のクラス
   */
  saveDataByStorage(data) {
    localStorage.setItem('user_setting#def_user_nm', data['def_user_nm']);
    localStorage.setItem('user_setting#def_dept_nm', data['def_dept_nm']);
    localStorage.setItem('user_setting#def_password', data['def_password']);
    return this;
  }

  /**
   * 個人情報をローカルストレージから取得
   * @returns 個人情報
   */
  getDataByStorage() {
    let data = {
      def_user_nm: localStorage.getItem('user_setting#def_user_nm'),
      def_dept_nm: localStorage.getItem('user_setting#def_dept_nm'),
      def_password: localStorage.getItem('user_setting#def_password'),
    };
    return data;
  }

  /**
   * 表示
   * @returns 自身のクラス
   */
  show() {
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
}

const usForm = new UserSettingFormClass();
