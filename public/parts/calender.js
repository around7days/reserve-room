/**
 * カレンダークラス
 */
class CalenderClass {
  /**
   * コンストラクタ
   */
  constructor() {
    this.$calender;
    this.$datepicker;
  }

  /**
   * カレンダーの生成
   * @returns 自身のクラス
   */
  create() {
    this.$calender = $(`
      <div>
        <span class="h5">
          カレンダー
          <a data-id="refresh" class="material-icons">refresh</a>
        </span>
        <div data-id="datepicker"></div>
      </div>
    `);
    this.$datepicker = this.$calender.find('[data-id=datepicker]');

    // カレンダー設定
    this.$datepicker.datepicker({
      format: 'yyyy-mm-dd',
      language: 'ja',
      daysOfWeekHighlighted: [0, 6],
      todayHighlight: true,
      weekStart: 1,
      maxViewMode: 'days',
      beforeShowDay: function (date) {
        // 祝日設定
        let holiday = JapaneseHolidays.isHoliday(date);
        if (holiday) {
          return {
            classes: 'calender-holiday',
            tooltip: holiday,
          };
        }
      },
    });

    // リフレッシュボタン設定
    this.$calender
      .find('[data-id=refresh]')
      .css('font-size', '100%')
      .css('cursor', 'pointer')
      .on('click', () => this.setToday());

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
   * カレンダーの取得
   * @returns カレンダー
   */
  get() {
    return this.$calender;
  }

  /**
   * 日付の設定
   * @param date 日付
   * @returns 自身のクラス
   */
  setDate(date) {
    this.$datepicker.datepicker('setDate', date.toDate());
    return this;
  }

  /**
   * 日付の取得
   * @returns 日付
   */
  getDate() {
    let date = this.$datepicker.datepicker('getDate');
    return moment(date);
  }

  /**
   * 当日選択
   * @returns 自身のクラス
   */
  setToday() {
    this.setDate(moment());
    return this;
  }

  /**
   * 前日選択
   * @returns 自身のクラス
   */
  setPrevDate() {
    let date = this.getDate().add(-1, 'days');
    this.setDate(date);
    return this;
  }

  /**
   * 翌日選択
   * @returns 自身のクラス
   */
  setNextDate() {
    let date = this.getDate().add(1, 'days');
    this.setDate(date);
    return this;
  }

  /**
   * 日付変更イベントのコールバックセット
   * @returns 自身のクラス
   */
  setChangeDateEvent(callback) {
    this.$datepicker.on('changeDate', (e) => {
      callback(moment(e.date));
    });
    return this;
  }

  /**
   * 活性化/日活性制御
   * @params isDisabled [true:非活性 false:活性]
   */
  disabled(isDisabled) {
    if (isDisabled) {
      this.$datepicker.datepicker('setDaysOfWeekDisabled', '0,1,2,3,4,5,6');
    } else {
      this.$datepicker.datepicker('setDaysOfWeekDisabled', '');
    }
    return this;
  }
}

const calender = new CalenderClass();
