(function () {
  // IEの場合Edgeに転送を促すメッセージを表示
  var userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('msie') != -1 || userAgent.indexOf('trident') != -1) {
    var newHtml = '<div>IE is not supported. Open site by Edge. <a href="microsoft-edge:' + location.href + '">Click here.</a></div>';
    document.querySelector('body').innerHTML = newHtml;
    throw new Error('IE is not supported.');
  }
})();
