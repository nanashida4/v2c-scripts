//【登録場所】 全体、レス表示
//【ラベル】画像リンク抽出
//【内　容】ImageViewURLReplace.datをもとにした画像リンクの抽出。(tree.jsにもありますが)
//【コマンド】 $SCRIPT image.js
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
            if(lnks[il].type_IMAGE) {
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

//if(lnks[il].type_IMAGE)
//↓
//if(lnks[il].url.toString().match(/\.(jpg|png|gif|tiff)/i))
//に変更すると、ImageViewURLReplace.datを無視して
//URLに画像の拡張子が含まれている物だけを抽出表示します。