// 【登録場所】 リンク
// 【ラベル】 お気に入りスレ差替
// 【コマンド】 ${SCRIPT:SVfp} changeFavoriteThread.js
// 【内容】 次スレ検索が役に立たない場合で、誘導リンク右クリからお気に入りの差し替えをする。
// 【備考】 たとえば「過去スレ」を「スレ一覧にない過去スレ」に、「元スレ」を「元スレとは別の板のスレ」に差し替える。
// 【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
var fvs = v2c.favorites;
var th = vcx.thread;
var to = v2c.getThread(vcx.link.url);
function addThread(fav,f){
  var fc = f.childCount;
  if (fc > 0){
    for (var i = 0; i < fc; i++){
      var o = f.getChild(i);
      addThread(fav,o);
      var ot = o.thread;
      if (ot && ot.key == th.key){
        fav.insertItem(f,to,i);
      }
    }
  }
}
function changeFavoriteThread() {
  for (var i = 0, c = fvs.count; i < c; i++){
    var fav = fvs.getFavorite(i);
    var f = fav.root;
    addThread(fav,f);
    fav.removeItem(th);
  }
  v2c.resPane.selectedColumn.openThread(to,false,false,false);
  to.updateAndWait();
  to.importPropertyFrom(th);
}
changeFavoriteThread();
// ----- 前の行まで -----