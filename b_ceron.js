//【登録場所】リンク
//【ラベル】Ceron.jpブックマーク情報表示
//【内容】選択したURLがCeron.jpに登録されていれば、登録ユーザー数とタグを表示。1.0.6_38で動作確認。
//外部コマンド→一般→リンクに登録してリンクを右クリックから実行も可。複数リンクが対象の場合は不可。
//【コマンド1】$SCRIPT b_ceron.js

function getCeron(){
  ss=" ";
  if (v2c.context.selText){
    ss = v2c.context.selText;
  }
  if (v2c.context.link){
    ss = v2c.context.link;
    ss=ss.toString();
  }

ss=removeProtocol(ss);
ss=ss.replace("://","");
ss='http://ceron.jp/url/'+encodeURI(ss);

  if (!ss) {
    v2c.context.setPopupText("選択テキストを取得できませんでした。");
    return;
  }

  var pbaseuri = "http://ceron.jp/";
  var sh = v2c.readURL(ss);
  if (!sh) {
    v2c.context.setPopupText("ページを取得できませんでした。");
    return;
  }
  var title = sh.match(/<title>404 - Ceron.jp<\/title>/i);
  if (title) {
    v2c.context.setPopupText("このページはまだブックマークされていません。");
    return;
  }
  var mr = sh.match(/<div class="property_control">\n(.+?)<\/a>　<\/span>/i);
  if (!mr) {
    v2c.context.setPopupText("ブックマーク情報を抽出できませんでした。");
    return;
  }

  var bmuser=RegExp.$1;

  //BBSに長い行が貼れないので分割
  var ph="<html><head><base href=\""+pbaseuri;
  ph=ph+"\"></head><body><div>"+bmuser;
  ph=ph+"</a>　</span></div><div><a href=\""+ss;
  ph=ph+"\">すべてのブックマークを見る</a></div></body></html>";
  v2c.context.setPopupHTML(ph);

}//getCeron();

function removeProtocol(txt){
  var ptn=/\:\/\//i;
  var idx=txt.search(ptn);
  var uri=txt.slice(idx);
  return uri;
}
getCeron();