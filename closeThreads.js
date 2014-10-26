//【登録場所】全体、レス表示
//【ラベル】開いてるスレを閉じる
//【内容】開かれているスレにおいて、指定条件に合致するものを閉じる
//【コマンド1】${SCRIPT:Fr} closeThreads.js
//【コマンド2】${SCRIPT:Fr} closeThreads.js 10 10 105 100.5 10 1   チェックやテキストボックスの初期値を指定。
//【コマンド3】${SCRIPT:Fr} closeThreads.js 10 10 1010 1020 10current,software 1   
//1つ目-未読無し
//2つ目-dat落ちor1000到達
//3つ目-○時間書き込みなし
//4つ目-勢い
//5つ目-板指定
//6つ目-閉じる前に確認
//一桁目がAc(1ならON） 2桁目が&と|(1なら|が選択)に対応する。 テキストボックスの初期値は3桁目以降に入力する
//コマンド2の例だと 時間の初期値が5、勢いが0.5
//コマンド3の例だと、時間の初期値が10、勢いが20 板初期値が(開いてる板,ソフトウェア板)
//「板指定」にcurrentを設定すると、現在開いている板に置き換わる
//【スクリプト】

function createPopup() {
  var args = v2c.context.args;
  var checked = 'checked';
  var checks = new Array(6);
  var newresi = 0,
   dati = 1,
   houri = 2,
   speedi = 3,
   boardi = 4, 
   confirmi = 5;
  
  for (var i = 0; i < checks.length; i++) {
    var p = {
      check: '',
      andCheck: checked,
      orCheck: '',
      text: ''
    };
    if (args[i]) {
      var op = args[i] + '';
      p.check = op.charAt(0) == '1' ? checked : '';
      p.orCheck = op.charAt(1) == '1' ? checked : '';
      p.andCheck = !p.orCheck ? checked : '';
      p.text = op.substr(2);
    }
    checks[i] = p;
  }
  //現在開いているスレの板を初期値として登録
  if (checks[boardi].text.indexOf('current') != -1) {
    if (!v2c.context.thread) {
      v2c.alert("指定板初期値取得に失敗しました。")
      return;
    }
    checks[boardi].text = checks[boardi].text.replace('current', v2c.context.thread.board.key);
  }

  var h = '<html>' + 
  '<head></head><body><form action="">'+
  '<table><tr><th>Ac</th><th>&</th><th>|</th><th>スレを閉じる条件</th></tr>\n'+
  '<tr><td><input type="checkbox" name="newres" ' + checks[newresi].check + '></td>' +
  '<td><input type="radio" name="newres" value="and" ' + checks[newresi].andCheck + '></td>' +
  '<td><input type="radio" name="newres" value="or"' + checks[newresi].orCheck + '></td>' +
  '<td>未読なし</td></tr>\n'+
  '<tr><td><input type="checkbox" name="dat" ' + checks[dati].check + '></td>' +
  '<td><input type="radio" name="dat" value="and" ' + checks[dati].andCheck + '></td>' +
  '<td><input type="radio" name="dat" value="or" ' + checks[dati].orCheck + '></td>' +
  '<td>dat落ちor1000到達</td></tr>\n'+
  '<tr><td><input type="checkbox" name="hour" ' + checks[houri].check + '></td>' +
  '<td><input type="radio" name="hour" value="and" ' + checks[houri].andCheck + '></td>' +
  '<td><input type="radio" name="hour" value="or"　' + checks[houri].orCheck + '></td>' +
  '<td>最終書き込みから<input type="text" name="hourtext" size="4" value="' + checks[2].text + '">時間以上書き込みがない</td></tr>\n'+
  '<tr><td><input type="checkbox" name="speed" ' + checks[speedi].check + '></td>' +
  '<td><input type="radio" name="speed" value="and" ' + checks[speedi].andCheck + '></td>' +
  '<td><input type="radio" name="speed" value="or"　' + checks[speedi].orCheck + '></td>' +
  '<td>勢いが<input type="text" name="speedtext" size="6" value="' + checks[speedi].text + '">以下</td></tr>\n'+
  '<tr><td><input type="checkbox" name="board" ' + checks[boardi].check + '></td>' +
  '<td><input type="radio" name="board" value="and" ' + checks[boardi].andCheck + '></td>' +
  '<td><input type="radio" name="board" value="or"　' + checks[boardi].orCheck + '></td>' +
  '<td>板key指定<input type="text" name="boardtext" size="20" value="' + checks[boardi].text + '">(複数の場合は,で区切る)</td></tr>\n'+
  
  '<tr><td  colspan="3" align="center"><input type="checkbox" name="confirm" ' + checks[confirmi].check + '></td>' +
  '<td>閉じる前に確認する</td></tr></table>\n'+
  '<p><input type="submit" name="close" value="実行"></p>\n' +
  '<p>AcがONの条件に対して下記両方を満たすスレを閉じます</p>'+
  '<ul><li>&にチェックが入った条件をすべて満たす</li>' +
  '<li>|にチェックが入った条件を1つ以上満たす</li></ul>' +
  '</form></body></html>';
  v2c.println(h);
  v2c.context.setPopupHTML(h);
  v2c.context.setPopupFocusable(true);
  v2c.context.setTrapFormSubmission(true);
}

function formSubmitted(u, sm, sd) {
  v2c.println(sd);
  if (sd.indexOf('confirmform=') != -1) {
    var m = sd.match(/(\d+)(?==on)/g);
    v2c.println(m);
    cm.closeByIndexes(m);
    v2c.context.closeOriginalPanel();
  }
  else {
    cm.clear();
    if (sd.indexOf('newres=on') != -1) {
      cm.setFunction('未読なし', function(th) {
        return !th.unread && !th.local;
      }, sd.indexOf('newres=and') != -1);
    }
    if (sd.indexOf('dat=on') != -1) {
      cm.setFunction('dat落ちor1000到達', function(th) {
        return !th.local && !th.bbs.twitter && (th.localResCount >= 1000 || !th.live);
      }, sd.indexOf('dat=and') != -1);
    }
    if (sd.indexOf('hour=on') != -1 && sd.match(/hourtext=([^&]+)/)) {
      var dtime = parseFloat(decodeURIComponent(RegExp.$1));
      if (dtime && dtime > 0) {
        cm.setFunction(dtime + '時間以上書き込みなし', function(th) {
          if (th.local || th.bbs.twitter) { //
            return false;
          }
          var res = th.getRes(th.localResCount - 1);
          if (res && res.time > 0) {
            var d = new Date();
            var dd = d.getTime() - res.time;
            if (dd / 1000 / 60 / 60 > dtime) {
              return true;
            }
          }
          return false;
        }, sd.indexOf('hour=and') != -1);
      }
      else {
        v2c.alert('時間を設定してください');
        return;
      }
    }
    if (sd.indexOf('speed=on') != -1 && sd.match(/speedtext=([^&]+)/)) {
      var speed = parseFloat(decodeURIComponent(RegExp.$1));
      if (speed && speed > 0) {
        cm.setFunction('勢い' + speed + '以下', function(th) {
          return th.speed < speed && !th.local && !th.bbs.twitter;
        }, sd.indexOf('speed=and') != -1);
      }
      else {
        v2c.alert('勢いを設定してください');
        return;
      }
    }
    if (sd.indexOf('board=on') != -1 && sd.match(/boardtext=([^&]+)/)) {
      var boards = decodeURIComponent(RegExp.$1).split(',');
      if (boards && boards.length > 0) {
        cm.setFunction('指定板', function(th) {
          for (var i = 0; i < boards.length; i++) {
            if (boards[i] == th.board.key) {
              return true;
            }
          }
          return false;
        }, sd.indexOf('board=and') != -1);
      }
      else {
        v2c.alert('板を設定してください');
        return;
      }
    }
    var isConfirm = sd.indexOf('confirm=on') != -1;
    closeThreads(isConfirm);
  }
}


function closeThreads(confirm) {
  var tha = v2c.resPane.threads;
  if (tha.length == 0) {
    v2c.alert( "レス表示タブが存在しません。");
    return;
  }
  else if (cm.cancel()) {
    v2c.alert("条件を指定してください。");
    return ;
  }
  
  cm.setCloseThreads(tha);
  if (cm.closetha.length == 0) {
    v2c.alert('該当スレがありませんでした');
    return ;
  }
  else if (confirm) {
    createConfirmPopup(cm.reasons);
  }
  else {
    cm.close();
  }
  v2c.context.closeOriginalPanel();
}


function createConfirmPopup(messages) {
  var sb = java.lang.StringBuilder();
  sb.append('<html><body><form action=""><p>チェックをつけたスレを閉じます。</p>' +
  '<input type="submit" name="confirmform" value="実行"><br><table>\n');
  for (var i = 0; i < messages.length; i++) {
    sb.append('<tr><td><input type="checkbox" name="c' + i + '" checked></td><td>' +
    messages[i] +
    '</td></tr>\n');
  }
  sb.append('</table></form></body></html>');
  v2c.println(sb);
  v2c.context.setPopupHTML(sb);
  v2c.context.setTrapFormSubmission(true);
}

function CloseManager() {
  var andFn = [];
  var orFn = [];
  this.closetha = [];
  this.reasons = [];
  this.clear = function() {
    andFn.length = 0;
    orFn.length = 0;
    this.closetha.length = 0;
    this.reasons.length = 0;
  };
  this.setFunction = function(reason, func, b) {
    var fn = {
      "reason": reason,
      "func": func
    };
    if (b) {
      andFn.push(fn);
    }
    else {
      orFn.push(fn);
    }
  };
  
  //fnaは{reason:'理由',func:function(th)}のArray
  //条件を満たす場合はその理由を返す
  //isAndがtrueだと、fna[i].funcがすべてtrue、falseだといずれか一つがtrueで条件満
  var getCloseReason = function(fna, th, isAnd) {
    if (!fna || fna.length == 0) {
      return '条件なし';
    }
    var s = [];
    for (var i = 0; i < fna.length; i++) {
      s.push(fna[i].reason);
      if (fna[i].func(th) != isAnd) {
        return isAnd ? '' : fna[i].reason;
      }
    }
    return isAnd ? s.join('\n') : '';
  };
  this.setCloseThreads = function(tha) {
    this.closetha.length= 0;
    this.reasons.length=0;
    for (var i = 0; i < tha.length; i++) {
      var th = tha[i];
      if (!th) {
        continue;
      }
      var reason1 = getCloseReason(andFn, th, true);
      var reason2 = getCloseReason(orFn, th, false);
      var displayReason = orFn.length != 0 ? reason2 + ':' : '';
      if (reason1 && reason2) {
        this.closetha.push(th);
        this.reasons.push(displayReason + '(' + th.board.name + ')' + th.title);
      }
    }
  };
  this.cancel = function() {
    return orFn.length == 0 && andFn.length == 0;
  }

  this.close = function() {
    for (var i = 0; i < this.closetha.length; i++) {
      this.closetha[i].close();
      //v2c.println(this.closetha[i].title);
    } 
  }
  this.closeByIndexes = function(m) {
    var tha = [];
    for (var i = 0; i < m.length; i++) {
      tha.push(this.closetha[parseInt(m[i])]);
    }
    this.closetha = tha;
    this.close();
  }
}

var cm = new CloseManager();
createPopup();