//【登録場所】リンク・選択テキスト・レス表示
//【ラベル】QRコード生成
//【コマンド】$SCRIPT PopupQR.js
//【内容】QR-Code Generator（http://qrcode.kaywa.com/）を利用しQRコードを生成
// 登録がレス表示の場合は、そのスレの携帯用書き込み欄のURLで生成します。
//【スクリプト】
//設定
//QRコードの一辺のピクセル数
//使用環境にあわせて変更してください
var len = 350;
//設定ここまで

var vcx = v2c.context;
var th = vcx.thread;
//取得文字列
var str = '';

//選択テキストを取得
str = String(vcx.selText);
if(str.length>160){
  //取得した文字列が160文字以上の場合、エラーメッセージを表示し終了
  //（ttp://qrcode.kaywa.com/では160文字まで）
  v2c.alert('QRコードへ変換できるのは160文字までです。');
}else{
  if(str=='null'){
    //選択テキストを取得できなかった場合はリンクを取得
    str = String(vcx.link);
  }
  if(str=='null' && th.bbs.is2ch){
    str = 'h' + 'ttp://c.2ch.net/test/-/' + th.board.key + '/' + th.key + '/w';
  }
  if(str!='null'){
    //HTML生成
    var s = '<html><body>' + str.replace(/\n/g,'<br>') + '<br>';
    s = s + '<img src="http://qr.kaywa.com/img.php?s=8&d=' + encodeURI(str) + '" height="'+len+'" width="'+len+'" alt="QRCode"/>';
    s = s + '</body></html>';
    //表示
    vcx.setPopupHTML(s);
  }
}