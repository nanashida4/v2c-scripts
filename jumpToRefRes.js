//【登録場所】 全体、レス表示
//【ラベル】 アンカーをつけられたレスへジャンプ
//【内容】 実行するごとに被参照数の多いものから順にジャンプ
//被参照数ランキングを上から順にクリックしていくのをキーバインドやジェスチャで手軽にやるための物
//T20110522以降のみ対応
//一度使用したスレでは、再起動するまでどこまで見たかを記録してます(クリアする場合はreset指定で実行)
//1周すると音がなります
//【コマンド1】 $SCRIPT jumpToRefRes.js       次の被参照レスへ移動
//【コマンド2】 $SCRIPT jumpToRefRes.js next  コマンド1と同じ
//【コマンド3】 $SCRIPT jumpToRefRes.js prev  前の被参照レスへ移動
//【コマンド4】 $SCRIPT jumpToRefRes.js 2     指定回数以上参照された被参照レスのみ対象とする(この場合は2つ以上アンカーをつけられたレスのみ)
//【コマンド5】 $SCRIPT jumpToRefRes.js reset 保持している全てのスレの前回表示したレス番をクリア(最初へ飛びなおす場合等に使用)
//next|prev|resetとしきい値は同時指定可能。順番もバラバラでおｋ。
//nextをE、prevをctrl+E、resetをshift+ctrl+E　のようにctrlとshiftの組み合わせで登録すると分かりやすくてオススメ？
function resContainer(ts, lrcnt, resa) {
  this.cidx = 0;
  this.setValues(ts, lrcnt, resa);
}

resContainer.prototype.setValues = function(ts, lrcnt, resa) {
  this.ts = ts;
  this.resCnt = lrcnt;
  this.resa = resa;
};

resContainer.prototype.getCurrentNumber = function() {
  if (this.resa.length > 0) {
    return this.resa[this.cidx].number;
  }
  else {
    return "";
  }
};

resContainer.prototype.moveToNextNumber = function(isNext, cnumber) {
  if (this.resa.length <= 0) {
    return;
  }
  if (cnumber) {//指定された場合は、指定レス番の次のレスに移動
    for (var i = 0; i < this.resa.length; i++) {
      if (cnumber == this.resa[i].number) {
        this.cidx = i;
        break;
      }
    }
  }
  this.cidx += isNext ? 1 : -1;
  if (this.cidx < 0) {
    this.cidx = this.resa.length - 1;
    v2c.beep();
  }
  else if (this.cidx >= this.resa.length) {
    this.cidx = 0;
    v2c.beep();
  }
};

function jumpToRefRes(isNext, ts) {
  if (ts < 0) {
    v2c.alert('しきい値の設定がおかしいです');
    return;
  }
  var th = v2c.context.thread;
  if (!th || th.bbs.twitter || th.local) {
    v2c.alert('スレッド取得失敗or非対応スレ');
    return;
  }
  var v = v2c.getScriptObject();
  if (!v) {
    v = {};
    v2c.setScriptObject(v);
  }
  var container = v[th.url];
  var fIdxes = v2c.context.filteredResIndex;
  //表示中のレス数、しきい値が変わってない場合は変更なしとしてキャッシュを利用する
  if (container && container.resCnt == fIdxes.length && container.resa.length > 0 && container.ts == ts) {
    container.moveToNextNumber(isNext);
    v2c.openURL(th.url + container.getCurrentNumber(), false, false);
    //v2c.println(container.cidx);
  }
  else {
    var resa = [];
    for (var i = 0; i < fIdxes.length; i++) {
      var res = th.getRes(fIdxes[i]);
      if (res && res.refResIndex && res.refResIndex.length >= ts) {
        //v2c.println(res.index);
        var r = {
          number: res.number,
          refResIndexCnt: res.refResIndex.length
        };
        resa.push(r);
      }
    }
    resa.sort(function(a, b) {
      var d = b.refResIndexCnt - a.refResIndexCnt;
      if (d == 0) return a.number - b.number;
      else         
        return d;
    });
    
    if (!container) {
      container = new resContainer(ts, fIdxes.length, resa);
    }
    else {
      container.setValues(ts, fIdxes.length, resa);
      if (resa.length > 0) {
        container.moveToNextNumber(isNext, container.getCurrentNumber());
      }
    }
    v2c.openURL(th.url + container.getCurrentNumber(), false, false);
    //v2c.println(th.url + container.getCurrentNumber());
    v[th.url] = container;
  }
}

var args = v2c.context.args;
var isNext = true;
var ts = 0;//しきい値
for (var i = 0; i < args.length; i++) {
  switch (args[i] + '') {
    case 'next':
      isNext = true;
      break;
    case 'prev':
      isNext = false;
      break;
    case 'reset':
      v2c.setScriptObject(null);
      break;
    default:
      var tmp = parseInt(args[i]);
      if (tmp) {
        ts = tmp;
      }
  }
}
jumpToRefRes(isNext, ts);
