/**
 * 予約カードクラス
 */
class ReserveCard {
  /**
   * コンストラクタ<br>
   * @param card 予約カードエレメント（未指定可）
   */
  constructor(card) {
    this.card = null;
    if (card) {
      this.$card = $(card);
    }
  }

  /**
   * 予約カードエレメントの生成
   * @returns 予約カードクラス
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
   * 予約情報をセット
   * @param data 予約情報
   * @returns 予約カードクラス
   */
  setData(data) {
    // 予約カードに表示する値の生成
    let cardText =
      data['user_nm'] +
      '<br>' +
      moment(data['start_time']).format('HH:mm') +
      '～' +
      moment(data['end_time']).format('HH:mm') +
      '<br>' +
      data['reason'];

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
   * @returns 予約カードクラス
   */
  setSize(width, height) {
    this.$card.css('width', width);
    this.$card.css('height', height);
    return this;
  }

  /**
   * 横幅セット
   * @param width 横幅(px)
   * @returns 予約カードクラス
   */
  setWidth(width) {
    this.$card.css('width', width);
    return this;
  }

  /**
   * 縦幅セット
   * @param height 縦幅(px)
   * @returns 予約カードクラス
   */
  setHeight(height) {
    this.$card.css('height', height);
    return this;
  }

  /**
   * イベントをセット
   * @param event イベント
   * @param callback コールバック関数
   * @returns 予約カードクラス
   */
  setEvent(event, callbackFnc) {
    this.$card.on(event, callbackFnc);
    return this;
  }
}
