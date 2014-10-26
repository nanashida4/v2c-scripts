//【登録場所】レス表示
//【ラベル】嫌儲IDレス検索
//【内容】嫌儲のIDでレス検索する(http://anosono.mooo.com/search)
//【コマンド】${SCRIPT:STw} searchKenmoID.js
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
var res = vcx.res;
var th = vcx.thread;
function formSubmitted(u,sm,sd) {
  v2c.browseURLDefExt(u);
}
if (th && res && th.board.key.equals('poverty')) {
  var ID='';
  var TRIP='';
  var CAP='';
  var BEID='';
  if (res.id && res.id.match(/^([.\+\/\w]{9})/)) {
    var ID = '<option value="ID:' + RegExp.$1+'" selected>ID';
  }
  if (res.name.match(/◆([\.\/0-9A-Za-z]{10})/)) {
    var TRIP = '<option value="TRIP:' + RegExp.$1+'">TRIP';
  }
  if (res.name.match(/(.+?)\s★/)) {
    var CAP = '<option value="CAP:' + RegExp.$1+'">CAP';
  }
  if (res.beID){
    var BEID = '<option value="BEID:' + res.beID+'">BEID';
  }
  vcx.setPopupHTML('<html><body style="margin:10px;">嫌儲レス検索'
    +'<form action="h'+'ttp://anosono.mooo.com/search">'
    +'<select name="q">'+ID+TRIP+CAP+BEID+'</select>'
    +'<input type="submit" value="実行">'
    +'</form>'
    +'</body></html>');
  vcx.setTrapFormSubmission(true);
} else {
  v2c.alert('ここじゃ使えません。');
}