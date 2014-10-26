//【登録場所】全体
//【ラベル】被参照とリンクを含むレスを抽出
//【内容】非表示を除いた閾値以上の被参照レスと、リンクを含むレスを抽出する
//【コマンド】$SCRIPT filterRefAndLink.js
//【スクリプト】
var ts = 3;//閾値
var vcx = v2c.context;
var th = vcx.thread;
if (th) {
  var nr = th.localResCount;
  var bo = false;
  var ar = new Array();
  for (var i=0; i<nr; i++) {
    var rs = th.getRes(i);
    if (rs && !rs.ng) {
      if (rs.links.length != 0) {
        ar.push(i);
      } else if (getRefResNumWithoutNG(th,rs) >= ts){
        ar.push(i);
      } else if (!bo) {
        bo = true;
      }
    }
  }
  if (bo) {
    vcx.setFilteredResIndex(ar);
  }
}
function getRefResNumWithoutNG(th,res) {
  var rri = res.refResIndex;
  if (!rri) {
    return 0;
  }
  var cnt = 0;
  for (var i = 0; i < rri.length; i++) {
    var rrs = th.getRes(rri[i]);
    if (rrs && !rrs.ng){ //透明非表示のみ抽出から除きたい場合は「!rrs.ng」を「!rrs.ngTransparent」に変更
      cnt++;
    }
  }
  return cnt;
}
