$(function () {
  /** 送信ボタン押下 */
  $('#sendBtn').on('click', doSend);

  function doSend() {
    let jsonData = null;
    if ($('#reqData').val() != '') {
      jsonData = JSON.parse($('#reqData').val());
    }

    $.ajax({
      url: SERVER_URL + $('#url').val(),
      type: $('#type').val(),
      dataType: 'json',
      data: jsonData,
      async: false,
    })
      .done((data) => {
        console.log(data);
        $('#resData').val(JSON.stringify(data));
      })
      .fail((res) => {
        console.log(res);
        $('#resData').val('システムエラーが発生しました。\r\n' + JSON.stringify(res));
      });
  }
});
