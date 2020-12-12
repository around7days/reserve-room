/**
 * 予約カードクラス
 */
class ReserveCardClass {
  /**
   * コンストラクタ
   */
  constructor() {
    this.card = null;
  }

  /**
   * 予約カードエレメントの生成
   * @returns 自身のクラス
   */
  create() {
    this.$card = $(`
      <div class="card reserve-card overflow-hidden">
          <div class="card-body">
              <p class="card-text"></p>
          </div>
      </div>
    `);
    return this;
  }

  /**
   * 予約カードエレメントの取得
   * @returns 予約カード
   */
  get() {
    return this.$card;
  }

  /**
   * 予約カードエレメントの取得
   * @param card 予約カード
   * @returns 自身のクラス
   */
  set(card) {
    this.$card = $(card);
    return this;
  }

  /**
   * 予約情報をセット
   * @param data 予約情報
   * @returns 自身のクラス
   */
  setData(data) {
    // 予約カードに表示する値の生成
    let cardText = data['user_nm'] + '<br>' + data['start_time'] + '～' + data['end_time'] + '<br>' + data['reason'];

    // ラベル＋吹き出しを設定
    this.$card.find('.card-text').html(cardText);
    this.$card.attr('title', cardText);
    this.$card.tooltip({ html: true, trigger: 'hover' });

    // 内部に全情報を埋め込む
    this.$card.attr('data-reserve-info', JSON.stringify(data));
    return this;
  }

  /**
   * 予約情報を取得
   * @return 予約情報
   */
  getData() {
    let data = JSON.parse(this.$card.attr('data-reserve-info'));
    return data;
  }

  /**
   * 縦横セット
   * @param width 横幅(px)
   * @param height 縦幅(px)
   * @returns 自身のクラス
   */
  setSize(width, height) {
    this.$card.css('width', width);
    this.$card.css('height', height);
    return this;
  }

  /**
   * 横幅セット
   * @param width 横幅(px)
   * @returns 自身のクラス
   */
  setWidth(width) {
    this.$card.css('width', width);
    return this;
  }

  /**
   * 縦幅セット
   * @param height 縦幅(px)
   * @returns 自身のクラス
   */
  setHeight(height) {
    this.$card.css('height', height);
    return this;
  }

  /**
   * イベントをセット
   * @param event イベント
   * @param callback コールバック関数
   * @returns 自身のクラス
   */
  setEvent(event, callbackFnc) {
    this.$card.on(event, callbackFnc);
    return this;
  }

  /**
   * 対象の予約カードを削除
   * @card 予約カード
   * @returns 自身のクラス
   */
  removeA(card) {
    $(card).remove();
    return this;
  }

  /**
   * 予約カードを全て削除
   * @returns 自身のクラス
   */
  removeAll() {
    $('div.reserve-card').each(function () {
      $(this).remove();
    });
    return this;
  }
}

const reserveCard = new ReserveCardClass();
