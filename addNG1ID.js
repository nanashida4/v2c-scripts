//【登録場所】全体、レス表示
//【ラベル】単発IDをすべて非表示
//【内容】単発IDをすべて非表示IDに追加して再表示ます。
//【コマンド】$SCRIPT addNG1ID.js
//【スクリプト】
var vcx = v2c.context;
var th = vcx.thread;
if (th) {
  var nr = th.localResCount;
  var bo = false;
  var ar = new Array();
  for (var i = 0; i < nr; i++) {
    var rs = th.getRes(i);
    if (rs) {
      if (rs.idCount == 1) {
        rs.addNGID();
        v2c.println(rs.id);
      }
    }
  }
}
v2c.resPane.checkNG(th);
