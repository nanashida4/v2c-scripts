// 【登録場所】 全体、レス表示
// 【ラベル】dat落ちスレタブへ移動
// 【内容】開かれているスレタブの中で、dat落ちのスレを開く。
// 【コマンド】 $SCRIPT moveToDatOchi.js     スレタブの中の一番最初にあるdat落ちスレを開く
// 【コマンド】 $SCRIPT moveToDatOchi.js 1   現在表示中のスレがdat落ちスレの場合は、そのスレ以降にあるdat落ちスレタブを開く。
// 【スクリプト】
// ----- 次の行から -----
var tha = v2c.resPane.threads;
var currentTh = v2c.context.args.length > 0 ? v2c.context.thread : null;
var read = false;
var firstTh,moveTh;
for (var i = 0; i < tha.length; i++) {
  var th = tha[i];
  if (th.local || th.bbs.twitter || th.live) {
    continue;
  }

  if (!firstTh) {
    firstTh = th;
  }
  if (read || !currentTh || currentTh.live) {
    moveTh = th;
    break;
  }
  else if (!read && th.board.key.equals(currentTh.board.key) && th.key.equals(currentTh.key)) {
    read = true;
  }
}

if (moveTh) {
  moveTh.open(false);
}
else if (firstTh) {
  firstTh.open(false);
}
// ----- 前の行まで -----