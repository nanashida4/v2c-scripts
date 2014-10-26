//【登録場所】全体、レス表示
//【ラベル】画像レスまとめ(単スレ)
//【内容】開いているスレッドから画像が含まれるレスのみを抽出し、ローカルスレッドを作成する。
//【コマンド】${SCRIPT:Fw} imageExtract.js ローカル板のフォルダ
//【更新日】 2010/03/30
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/851
//【スクリプト】
// ----- 次の行から -----
function createImageResThread() {
  var args = v2c.context.args;
  if (args.length == 0) {
    return "板のフォルダが指定されていません。";
  }
  var bd = v2c.getLocalBoard(args[0]);
  if (!bd) {
    return "ローカル板を取得できませんでした。";
  }
  var th = v2c.context.thread;
  if (!th || th.local || th.bbs.twitter) {
    return "非対応スレ";
  }
  var resCnt = th.localResCount, imgRes = [];
  for (var j = 0; j < resCnt; j++) {
    var res = th.getRes(j);
    if (res) {
      for (var i = 0; i < res.links.length; i++) {
        if (res.links[i].type_IMAGE) {
          imgRes.push(res);
          break;
        }
      }
    }
  }

  if (imgRes.length == 0) {
    return "画像レスが存在しません。";
  }
  var lth = bd.createLocalThread("画像レス抽出＠" + th.title + "＠" + th.board.name, imgRes);
  if (!lth) {
    return "ローカルスレッドを作成できませんでした。";
  }
  lth.open(false);
  return null;
}

var se = createImageResThread();
if (se) {
  v2c.alert(se);
}
// ----- 前の行まで -----
