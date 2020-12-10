/**
 * 個人情報設定フォームクラス
 */
class UserSettingForm {
  /**
   * 個人情報設定フォームの生成
   * @returns 予約カードクラス
   */
  create() {
    this.$card = $(`
      <div class="modal fade" id="userSettingForm" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalLabel">個人設定</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div>
                <h6 class="modal-title" id="modalLabel">初期値設定</h6>
                <div class="form-row">
                  <div class="form-group col-4">
                    <label class="col-form-label">氏名</label>
                    <input type="text" class="form-control" id="defUserNm" />
                  </div>
                  <div class="form-group col">
                    <label class="col-form-label">部署</label>
                    <input type="text" class="form-control" id="defDeptNm" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group col-4">
                    <label class="col-form-label">パスワード</label>
                    <input type="password" class="form-control" id="defPassword" />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" id="saveBtn" class="btn btn-primary">保存</button>
            </div>
          </div>
        </div>
      </div>
    `);
    return this;
  }
}
