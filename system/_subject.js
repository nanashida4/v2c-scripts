//【登録場所】 "V2C\script\system\subject.js"
//【内容】 板のスレ一覧（subject.txt）を変更
//【備考】・checkSubject(ss,bd,cx)はsubject.txtを実際に取得した時にのみ実行されます。
//　　　　（例えばHTTPレスポンスコードが 304 Not Modified. の時は実行されない。）
//　　　　・現在（2.10.0 [R20120923]）ローカル板・Twitter仮想板でcheckSubject(ss,bd,cx)は実行されませんが、
//　　　　将来実行される可能性があります。 
//　　　　・subject.jsを変更した時は「ファイル」メニューの「再読み込み」→「subject.js」で再読み込みすることができます。 
//【スクリプト】
// ----- 次の行から -----
//subject.txtを取得した後解析する前に実行
function checkSubject(ss,bd,cx) {
  /* 機能を有効にしたい場合、下の各行頭//を削除してください  */
//  ss = sort924ToBottomLine(ss,bd,cx); //ソフトウェア板でスレッド924を下げてスレタイの先頭に★を追加
  return ss;
}

function sort924ToBottomLine(ss,bd,cx) {
  if (!bd.bbs.is2ch||(bd.key!='software')) {
    return ss;
  }
  var re=new RegExp('^(\\d+)\\.dat<>(.+) \\((\\d+)\\)$','gm');
  var ls=[],ls9=[];
  var rt;
  while (rt=re.exec(ss)) {
    if (rt[1][0]=='9') {
      ls9.push(rt[1]+'.dat<>★ '+rt[2]+' ('+rt[3]+')\n');
    } else {
      ls.push(rt[0]+'\n');
    }
  }
  return ls.concat(ls9).join('');
}
