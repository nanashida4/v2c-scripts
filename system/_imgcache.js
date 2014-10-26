//【登録場所】 "V2C\script\system\imgcache.js"
//【内容】imgcache.jsのまとめ(デフォルトはTwitterのみで新着ダウンロード、ローカルではしない)
//【補足】本スクリプト内の設定以外は，初期値として「設定」メニュー→「リンク・画像」→「新着画像ダウンロード」が適用されます
//        本スクリプトの設定のみで行いたい場合は、設定のinvalidDefaultをtrueにしてください。
//【スクリプト】
// ----- 次の行から -----
// 対象文字列のチェック
function checkThStr(str, target) {
  var tlen, i;
  if ((tlen = target.length) > 0) {
    for (i=0; i<tlen; i++) {
      if (str.indexOf(target[i]) > -1) {
        return true;
      }
    }
  }
  return false;
}

function getDownloadNewImagesLimit(th,ov) {
  /* 設定 */
  var all = false; //常に新着ダウンロードする
  var invalidDefault = false; //本スクリプトによる新着ダウンロードを除いてダウンロードしない(つまり、V2C内の初期設定値は無視する)
  var targetBoard = [ //対象とする板
    'dcamera',
    ]
  /* 設定ここまで */
  var bbs = th.bbs;
  if (
    all
    /* 個別のBBS・板・スレッドで新着ダウンロードしたい場合、下の例を参考に各行頭//を削除するなどしてください  */
//    || bbs.is2ch //スレッドが2ｃｈ
//    || bbs.is2cheq //スレッドが2ch互換板
//    || bbs.shitaraba //スレッドがしたらば
//    || bbs.machi //スレッドがまちBBS
    || bbs.twitter //スレッドがTwitter
//    || th.local //スレッドがローカル板
//    || bbs.is2ch && checkThStr(th.board.key, target) //2chのデジカメ板でのみ
    /* 例ここまで */
    ) {
    ov.maxdays = 2; // 2日前まで
    ov.maximgs = 100; // 100枚まで
  } else if (
    invalidDefault
    /* 個別のBBS・板・スレッドで新着ダウンロード "しない" 場合、下の例を参考に各行頭//を削除するなどしてください  */
//    || bbs.is2ch //スレッドが2ｃｈ
//    || bbs.is2cheq //スレッドが2ch互換板
//    || bbs.shitaraba //スレッドがしたらば
//    || bbs.machi //スレッドがまちBBS
//    || bbs.twitter //スレッドがTwitter
    || th.local //スレッドがローカル板
    /* 例ここまで */
    ) {
    ov.maxdays = 0;
  }
}