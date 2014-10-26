//【登録場所】リンク
//【ラベル】はてなブックマークuser表示
//【内容】選択したURLがはてなブックマークに登録されていれば、登録ユーザー数と「ブックマークしているユーザー」を表示。1.0.6_24で動作確認。
//外部コマンド→一般→リンクに登録してリンクを右クリックから実行も可。複数リンクが対象の場合は不可。
//【コマンド1】$SCRIPT b_hatena.js
//【スクリプト】

//表示の仕方の指定。htypeが1ならユーザー数以外にブックマークされているページのタイトルや付けられているタグも表示。
//2ならユーザー数のみ。3なら1の内容に加えブックマークしているユーザー名も表示。
var htype=3;
//htypeに3を指定した場合のみ有効。ユーザー数がこの数を超えた場合は1で表示される内容で表示。
var maxuser=20;

function gethatebu(bh) {
  ss=" ";
  if (v2c.context.selText){
    ss = v2c.context.selText;
  }
  if (v2c.context.link){
    ss = v2c.context.link;
    ss=ss.toString();
  }

  if (ss) {ss = ss.trim();}
  if (!ss) {
    //v2c.alert("選択テキストを取得できませんでした。");
    v2c.context.setPopupText("選択テキストを取得できませんでした。");
    return;
  }
  ss=ss.replace("&", "%26");//URIに含まれる&を%26に変換しないと&以前をURIとして処理されてしまう
  var baseuri = "http://b.hatena.ne.jp/entry?mode=more&url=";
  var pbaseuri = "http://b.hatena.ne.jp/";
  ss=fixuri(ss);
  var su = baseuri+ss;
  var sh = v2c.readURL(su);
  if (!sh) {
    //v2c.alert("ページを取得できませんでした。");
    v2c.context.setPopupText("ページを取得できませんでした。");
    return;
  }
  var title = sh.match(/<title>はてなブックマーク - 未ブックマークエントリー<\/title>/i);
  if (title) {
    //v2c.alert("このページはまだブックマークされていません。");
    v2c.context.setPopupText("このページはまだブックマークされていません。");
    v2c.context.setPopupHTML('<html><head></head><body><div><a href=\"'+su+'\">はてなブックマーク - 未ブックマークエントリー</a></div></body></html>');
    return;
  }
  var mr = sh.match(/(<div class="entrytitle">(?:.|\n)*)<div id="bookmarks">/i);
  if (!mr) {
    //v2c.alert("ブックマーク情報を抽出できませんでした。");
    v2c.context.setPopupText("ブックマーク情報を抽出できませんでした。");
    v2c.context.setPopupHTML('<html><head></head><body><div><a href=\"'+su+'\">ページへのリンク</a></div></body></html>');
    return;
  }

  var bmuser=RegExp.$1;

  //gifを表示するとCPU利用率が100%になったままになるのでimg要素を削除
  bmuser=bmuser.replace(/<img[^>]+?>/g," ");

  switch (bh) {
    case 1:
    v2c.context.setPopupHTML("<html><head><base href=\""+pbaseuri+"\"></head><body><div>"+bmuser+"<a href=\""+su+"\">すべてのブックマークを見る</a></div></body></html>");
    break;
    case 2:
    bmuser=bmuser.match(/<a href="\/entry\/[^>]+>(\d+\suser(?:s|))<\/a>/i);
    bmuser=RegExp.$1;
    v2c.context.setPopupHTML("<html><head><base href=\""+pbaseuri+"\"></head><body><div>"+bmuser+"<br><a href=\""+su+"\">すべてのブックマークを見る</a></div></body></html>");
    break;
    case 3:
    nu=bmuser.match(/<a href="\/entry\/[^>]+>(\d+)\suser(?:s|)<\/a>/i);
    nu=RegExp.$1;
    if (nu > maxuser){
      v2c.context.setPopupHTML("<html><head><base href=\""+pbaseuri+"\"></head><body><div>"+bmuser+"<a href=\""+su+"\">すべてのブックマークを見る</a></div></body></html>");
    } else{
      tcon=sh.match(/(<div class="entrytitle">(?:.|\n)*)<p id="visibility-info">/i);
        if (!tcon) {
          //v2c.alert("ブックマークしているユーザー情報等を抽出できませんでした。");
          v2c.context.setPopupText("ブックマークしているユーザー情報等を抽出できませんでした。");
          return;
        }
      tcon=RegExp.$1;
      //gifを表示するとCPU利用率が100%になったままになるのでimg要素を削除
      tcon=tcon.replace(/<img[^>]+?>/g," ");
      v2c.context.setPopupHTML("<html><head><base href=\""+pbaseuri+"\"></head><body><div>"+tcon+"</div><a href=\""+su+"\">すべてのブックマークを見る</a></div></body></html>");
    }
    break;
  }
}

function fixuri(txt){
  var ptn=/\:\/\//i;
  var idx=txt.search(ptn);
  var turi=txt.slice(idx);
  var uri="http"+turi;
  return uri;
}

gethatebu(htype);