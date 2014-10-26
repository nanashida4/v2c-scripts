//【登録場所】リンク
//【ラベル】リンクのコピー(画像チェック)
//【内容】画像URLをコピーする。もしその画像URLが404なら警告を表示する
//【コマンド】${SCRIPT:S} ImgChecker.js
//【スクリプト】
var url = v2c.context.link;
var hr = v2c.createHttpRequest(url);
var data = hr.getContentsAsString();
var title = '';
if ( hr.responseCode == 404 ){
  v2c.alert( '404 見つからない' );
}
else if( hr.responseCode == 503 ){
  v2c.alert( '503 サーバが忙しい' );
}
else if( hr.responseCode == 200 ){
  if ( !hr.contentType.toString().match( /image\/.+/i ) ) {
    if(data.match(/<TITLE>(.+?)<\/TITLE>/i)){
      title = RegExp.$1;
    }
    v2c.alert( title  + '\n画像じゃないかも\n' +hr.contentType.toString() );
  }
}
else{}
v2c.context.setClipboardText(url);
