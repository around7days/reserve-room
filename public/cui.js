$(function () {
  /** サーバURL */
  const SERVER_URL = '';

  /** 送信ボタン押下 */
  $('#sendBtn').on('click', doSend);

  function doSend() {
    console.log('send');
    let jsonData = $('#url').val();
    if (jsonData == '') {
      jsonData = '{}';
    }

    $.ajax({
      url: SERVER_URL + url,
      type: $('#type').val(),
      dataType: 'json',
      data: JSON.parse($('#reqData').val()),
      async: false,
    })
      .done((data) => {
        $('#resData').val(JSON.stringify(data));
      })
      .fail((res) => {
        $('#resData').val('システムエラーが発生しました。\r\n' + JSON.stringify(res));
      });
  }
});
