//【登録場所】 レス表示、選択テキスト
//【ラベル】 キーネームラベル
//【内容】 キーワードに一致する名前・IDのレスすべてにラベルを付ける
//【コマンド1】$SCRIPT setKeynameLabels.js ラベル名　　　　　　　　　//選択テキストまたは実行したレスのIDをキーワードにする
//【コマンド2】$SCRIPT setKeynameLabels.js ラベル名 キーワード名
//【備考】キーワードの優先順位は，コマンドのキーワード名　＞　選択テキスト　＞　実行レスID　
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
var args = vcx.args;
var th = vcx.thread;
var keyword = args[1] || v2c.getSelectedText() || vcx.res.id;
if (th && keyword) {
  var nr = th.localResCount;
  var rl = v2c.getResLabel(args[0]);
  for (var i=0; i<nr; i++) {
    var rs = th.getRes(i);
    if (rs && rs.id) {
      if (rs.id.indexOf(keyword) != -1 || rs.name.indexOf(keyword) != -1) {
        rs.setResLabel(rl); //ラベルをクリアする場合は、この行頭に「//」を追加
//        rs.setResLabel(null); //ラベルをクリアする場合は、この行頭の「//」を削除
      }
    }
  }
}