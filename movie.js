//【登録場所】 全体、レス表示
//【ラベル】動画リンク抽出
//【内　容】リンクのホストだけで判断するスクリプトの例。下記はニコニコ動画及びYoutubeのリンクを抽出。
//【コマンド】 $SCRIPT movie.js
//【スクリプト】
// ----- 次の行から -----
var th=v2c.context.thread;
if (th) {
  var ll=[];
  var nr=th.resCount;
  for (var ir=0; ir<nr; ir++) {
    var res=th.getRes(ir);
    if (!res) {
      continue;
    }
    var lnks=res.links;
    for (var il=0; il<lnks.length; il++) {
      var sh=lnks[il].url.host;
      if (sh.endsWith(".nicovideo.jp")||sh.equals("nico.ms")||(sh.indexOf(".youtube.")>0)||sh.equals("youtu.be")) {
        ll.push(ir);
        break;
      }
    }
  }
  v2c.context.setFilteredResIndex(ll);
}
// ----- 前の行まで -----

//※最後から2行目を  v2c.context.setPopupResIndex(ll);　にすると、
//抽出したものをポップアップ表示します。
