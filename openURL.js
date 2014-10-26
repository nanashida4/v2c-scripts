//【登録場所】リンク
//【ラベル】外部で開く
//【内容】URLを、通常はデフォルト外部ブラウザに、特定の板でだけ別の外部アプリに送る
// ※任意で最初の'software'のところを特殊動作させたい板のキーに変更して，コマンドで外部アプリを指定する
//【コマンド】${SCRIPT:FxS} openURL.js 外部アプリパス名
//【コマンド例】${SCRIPT:FxS} openURL.js "C:\Program Files\Internet Explorer\iexplore.exe" //特定の板のみIEで開く
//【スクリプト】
// ----- 次の行から -----
//設定
var bdKey = 'software';//動作させたい板キー

function openURL() {
  var args = v2c.context.args;
  if (args.length == 0) {
    v2c.alart('起動するアプリケーションをパラメータで指定してください')
    return;
  }

  var lnk = v2c.context.link;
  var th = v2c.context.thread;
  var browserDir = args[0];
  if (th && th.board.key.equals(bdKey)) {
    v2c.exec(browserDir + ' "' + lnk + '"');
  }
  else {
    v2c.browseURLDefExt(lnk);
  }
}

openURL();