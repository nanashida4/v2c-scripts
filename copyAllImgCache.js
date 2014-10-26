//【登録場所】 全体、レス表示
//【ラベル】 このスレの画像キャッシュをすべて保存
//【内容】 実行したスレッドですでに取得した画像キャッシュをスレタイ名のフォルダ内にすべて保存
//※すでにダウンロードされたもののみ対象
//※ファイル名は元の名前ではなくハッシュ値です。(変更方法はわかりません。)
//【コマンド】 ${SCRIPT:Frw} copyAllImgCache.js
//【スクリプト】
// ----- 次の行から -----
var sf = 'C:\\Program Files\\V2C\\';//保存先

var vcx = v2c.context;
var th = vcx.thread;
var sf = sf + th.title;
if (th) {
  var nr = th.localResCount;
  for (var i=0; i<nr; i++) {
    var rs = th.getRes(i);
    if (rs) {
      var ls = rs.links;
      var ll = ls.length;
      for (var j=0; j<ll; j++){
        var cf = ls[j].imageCacheFile;
        if(cf) v2c.copyFileInto(cf,sf);
      }
    }
  }
}
// ----- 前の行まで -----