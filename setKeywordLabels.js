//【登録場所】 レス表示、選択テキスト
//【ラベル】 キーワードラベル
//【内容】 キーワードに一致するすべてのレスにラベルを付ける
//【コマンド1】$SCRIPT setKeywordLabels.js ラベル名 //選択テキストの場合
//【コマンド2】$SCRIPT setKeywordLabels.js ラベル名 キーワード名
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
var args = vcx.args;
var th = vcx.thread;
var keyword = args[1] || v2c.getSelectedText();
if (th && keyword) {
  var nr = th.localResCount;
  var rl = v2c.getResLabel(args[0]);
  for (var i=0; i<nr; i++) {
    var rs = th.getRes(i);
    if (rs) {
      if (rs.message.indexOf(keyword) != -1) {
        rs.setResLabel(rl); //ラベルをクリアする場合は、この行頭に「//」を追加
//        rs.setResLabel(null); //ラベルをクリアする場合は、この行頭の「//」を削除
      }
    }
  }
}