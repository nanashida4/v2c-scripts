//【登録場所】 全体、レス表示
//【ラベル】 レスタブソート
//【内容】 レスタブの順番を、未読レス無しの後、Dat落ちスレを並べる。最後に非表示でない未読レス数を昇順でソートする。
//※レスタブ設定で、「新しいタブの位置」を最後にして、「同じ板のスレッドの後に追加」のチェックをはずした場合です。
//※ロックしたスレッド、ローカル板、twitterはソート対象にならない。まとめて前方に移動する。
//※昇順を降順に変更するには29行目からあるソート例の「return」以降の「a.」と「b.」を入れ替える。
//※スレッド状態（未読有無、Dat落ち？、ソートスレ）の順番を変えるには59行目を変えてください。例：「ts = ss.concat(zs,ds);」でソートスレ、未読有無、Dat落ち？の順になる。
//※スレッド状態で分ける必要がなければ、設定の行でfalseを選択する。
//【コマンド】 $SCRIPT sortResTabs.js
//【スクリプト】
// ----- 次の行から -----
//設定
var divideTabsWithoutNewRes = true; //trueの場合、未読無しのスレを区別する。
var divideTabsWithDatOchi = true; //trueの場合、Dat落ちスレを区別する。
//
function getNewDispResCount(th) {
  var n = th.newMarkResCount;
  for (var l = th.localResCount, i = l - n; i < l; i++) {
    if (th.getRes(i).ng) n--;
  };
  return n;
};
function sortResTabs() {
  var rp = v2c.resPane;
  var col = rp.selectedColumn;
  var cidx = rp.selectedColumnIndex;
  var sidx = col.tabCount-1;
  var ts = col.threads;
  // ----- スレッド状態 -----
  var zs = []; //未読無しのスレッドArray
  var ds = []; //DAT落ちのスレッドArray
  var ss = []; //その他ソートスレッドArray
  // ----- ソート例、ここから -----
  var compareLocalResCounts = function(a, b) {return a.localResCount - b.localResCount;};//総レス数昇順
  var compareNewResCounts = function(a, b) {return a.newResCount - b.newResCount;};//新着レス数昇順
  var compareSpeeds = function(a, b) {return a.speed - b.speed;};//スレ速度昇順
  var compareNewDispResCounts = function(a, b) {return getNewDispResCount(a) - getNewDispResCount(b);};//非表示でない未読レス数昇順
  var compareBoardKey = function(a, b) { //板キー昇順(35～39行目まで)
    if (a.board.key < b.board.key) {return -1;}
    if (a.board.key > b.board.key) {return 1;}
    return 0;
    };
  // ----- ソート例、ここまで -----
  for (var i = ts.length - 1; i >= 0; i--) {
    var th = ts[i];
    if (th.lock || th.local || th.bbs.twitter) {
      continue;
    };
    if (!th.live && divideTabsWithDatOchi) {
      ds.push(th);
    } else if (getNewDispResCount(th) == 0 && divideTabsWithoutNewRes) {
      zs.push(th);
    } else {
      ss.push(th);
    };
  };
//  zs.sort(compareSpeeds);
//  ds.sort(compareLocalResCounts);
  ss.sort(compareNewDispResCounts);
  ts = zs.concat(ds,ss);
  for (var j = 0; j < ts.length; j++) {
    ts[j].movePanelTo(cidx,sidx);
  };
};
sortResTabs();
// ----- 前の行まで -----