//【登録場所】 全体、レス表示（キーバインドに設定する場合は全体に登録すること）
//【ラベル】 レスラベルへジャンプ
//【内容】 現在表示中のレス(全体登録時)、もしくは外部コマンドを実行したレス(レス表示登録時）より前/後のラベルが貼られたレスへ移動する
//引用レスもジャンプ先として扱う（引用レス着色設定していなくても同様）
//例外1)新着に該当レスがある場合は現在位置関係なくそのレスへジャンプ。
//例外2)移動後に移動先レスがレス表示欄の一番上に来ない場合は次へジャンプできない。
//【コマンド1】 $SCRIPT jumpToResLabel.js           (次のレスラベルへ移動)
//【コマンド2】 $SCRIPT jumpToResLabel.js next      (コマンド1と同等)
//【コマンド3】 $SCRIPT jumpToResLabel.js prev      (前のレスラベルへ移動)
//【コマンド4】 $SCRIPT jumpToResLabel.js レスラベル名    (特定のレスラベルとその引用レスのみを対象にする場合。複数指定可)
//next|prevとレスラベル名は同時指定可能。例) jumpToResLabel.js next 自分の書き込み
Array.prototype.contains = function(obj) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == obj) {
      return true;
    }
  }
  return false;
}

function jumpToResLabel(next, labels) {
  var th = v2c.context.thread;
  if (!th || th.bbs.twitter) {
    return;
  }
  var m = th.localResCount - th.newResCount;
  var def = next ? 1000 : -1;
  var cres = v2c.context.res;
  var ni = cres ? cres.index : def;
  var firstResi = def;
  var nextResi = def;
  var starti = 0;
  var fIdxes = v2c.context.filteredResIndex;
  for (var i = 0; i < fIdxes.length; i++) {
    var res = th.getRes(fIdxes[i]);
    if (res && res.resLabel && (labels.length == 0 || labels.contains(res.resLabel.name))) {
      var resIdxes = res.refResIndex;
      if (resIdxes) {
        resIdxes = resIdxes.concat(res.index);
      }
      else {
        resIdxes= [res.index];
      }
      for (var j = 0; j < resIdxes.length; j++) {
        var ri = resIdxes[j];
        if (ri >= m && starti == 0) {//新着にある場合はリセット
          starti = m;
          firstResi = def;
          nextResi = def;
        }
        if (ri >= starti) {
          if ((next && ni < ri && ri < nextResi) || (!next && nextResi < ri && ri < ni)) {
            nextResi = ri;
          }
          if ((next && firstResi > ri) || (!next && firstResi < ri)) {
            firstResi = ri;
          }
        }
      }
    }
  }
  if (nextResi != def) {
    v2c.openURL(th.url + (nextResi + 1), false);
  }
  else if (firstResi != def) {
    v2c.openURL(th.url + (firstResi + 1), false);
    v2c.beep();
  }
  else {
    v2c.beep();
  }
}


var args = v2c.context.args;
var next = true;
var labels = [];
for (var i = 0; i < args.length; i++) {
  if (args[i] == 'prev') {
    next = false;
  }
  else if (args[i] == 'next') {
    next = true;
  }
  else {
    labels.push(args[i] + '');
  }
}
jumpToResLabel(next, labels);