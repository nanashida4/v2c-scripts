//【登録場所】 全体(コマンド1, 2, 3, 4)、レス表示(コマンド1, 3, 4)
//【ラベル】 前スレを開く|前のレスに移動(前スレも含む)|新スレ用テンプレ作成
//【内容】 レス１から前スレッド候補を検索して、前スレッドを開くか、新スレッド用のテンプレ支援をします。
//【コマンド1】 ${SCRIPT:S} searchPrevThread.js //前スレを開く。
//【コマンド2】 ${SCRIPT:S} searchPrevThread.js prevres //通常は前のレスに移動、レス1で実行すると前スレの最後に移動。
//【コマンド3】 ${SCRIPT:S} searchPrevThread.js prevres newtab //【コマンド1,2】で引数newtabがあると新タブで開く。
//【コマンド4】 ${SCRIPT:S} searchPrevThread.js newthread //新スレ用にレス１のテンプレ作成支援
//※ 【コマンド4】は前スレがあれば現スレに置換、なければ追加してスレ立て表示します。
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context, res = vcx.res, th = vcx.thread;
var defaultTitle = String(th.title);
var defaultUrl = String(th.url);
var options = vcx.args;
var urlPtn = "(?:h?)(ttp:[/-=&\\w\\.\\?]+?(\\d{9,10})(?:\\.html|/?))";
var numPtn = "\\d〇一二三四五六七八九十百壱弐参肆伍陸漆捌玖拾陌佰０-９";

//半角算用数字に変換
function toHankakuNum(num) {
  var hanNums = new Array(2);
  for (i = 0; i < 4; i++) {
    if (i == 0) if (!isNaN(num)) hanNums[0] = num;
    if (i == 1) hanNums[0] = zenToHanNum(num);
    if (i == 2) hanNums[0] = kan1ToHanNum(num);
    if (i == 3) hanNums[0] = kan2ToHanNum(num);
    if(hanNums[0]) {
      hanNums[1] = i; return hanNums;
    }
  }
}
//全角の算用表記を半角算用に(タイプ1)
function zenToHanNum(num) {
  var rexp = new RegExp("[０-９]", "g");
  if(num.replace(rexp, "") != "") return null;
  return num.replace(rexp, function(num) {return String.fromCharCode(num.charCodeAt(0) - 65248);});
}
//漢字の算用表記を半角算用に(タイプ2)
function kan1ToHanNum(num) {
  var rexp = new RegExp("[〇一二三四五六七八九壱弐参肆伍陸漆捌玖]", "g");
  if(num.replace(rexp, "") != "") return null;
  var kanji = "〇一二三四五六七八九〇壱弐参肆伍陸漆捌玖";
  return num.replace(rexp, function(num,idx) {return kanji.indexOf(num) % 10;});
}
//漢数字の表記を半角算用に(タイプ3)
function kan2ToHanNum(num) {
  var digit = "一二三四五六七八九壱弐参肆伍陸漆捌玖";
  var rexp = new RegExp("[" + digit + "十百拾陌佰]", "g");
  if(num.replace(rexp,"") != "") return null;
  var i = 0, j = 1, k = 0;
  return num.replace(new RegExp("[" + digit + "十百拾陌佰]+","g"),
    function(num){
      var arr = num.replace(rexp,
        function(num){
          var n = digit.indexOf(num) + 1; if (n >= 10) n = n - 9;
          if (num == "十" || num == "拾") n = 10;
          else if (num == "百" || num == "佰" || num == "陌") n = 100;
          return n;
        }).match(/[1-9]??[1-9]0*/g)
      var n = m = 0; num = 0;
      for (var i = 0, l = arr.length; i < l; i++) {
        n = parseInt(arr[i]); m = parseInt(arr[i + 1]);
        if(n < 10 && m > 9) {num += n * m; i++;} else num += n;
      }
      return num;
    });
}
//全角数字に変換
function toZenkakuNum(num, type) {
  var numArr=[],zenNum,tmpNum;
  var num = parseInt(num);
  if(type <= 0 || type > 3) return null;
  if(type == 1) {
    zenNum = hanToZenNum1(num); if(zenNum) return [zenNum];
  } else if(type == 2) {
    zenNum = hanToZenNum2(num); if(zenNum) return [zenNum];
  } else if(type == 3 && num > 0 && num < 1000) {
    for (j = 0; j < 7; j++) {
      switch(j) {
        case 0 : zenNum = hanToKanNum(num); break;
        case 1 : zenNum = hanToKanNum(num, 1); break;
        case 2 : zenNum = hanToKanNum(num, 1, true); break;
        case 3 : zenNum = hanToKanNum(num, 2); break;
        case 4 : zenNum = hanToKanNum(num, 2, true); break;
        case 5 : zenNum = hanToKanNum(num, 3, true); break;
        case 6 : zenNum = hanToKanNum(num, 4, true); break;
        default: break;
      }
      if(zenNum && tmpNum != zenNum) {
        numArr.push(zenNum); tmpNum = zenNum;
      }
    }
    if(numArr.length > 0) return numArr;
  }
  return null;
}
//半角算用表記を全角算用に
function hanToZenNum1(num) {
  num = String(num); if(isNaN(num)) return;
  return num.replace(/\d/g, function(num) {return String.fromCharCode(num.charCodeAt(0) + 65248);});
}
//半角算用表記を全角算用漢数字に
function hanToZenNum2(num) {
  num = String(num); if(isNaN(num)) return;
  var kanji = "〇一二三四五六七八九";
  return num.replace(/\d/g, function(num) {return kanji.charAt(num);});
}
//半角算用表記を全角漢数字に
function hanToKanNum(num, type, one) {
  if(type > 5 || type < 0 || isNaN(num)) return null; if(!type) type = 0;
  var digits = new Array(4);
  digits[0] = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "百"];
  digits[1] = ["", "壱", "弐", "参", "四", "五", "六", "七", "八", "九", "拾", "百"];
  digits[2] = ["", "壱", "弐", "参", "四", "伍", "六", "七", "八", "九", "拾", "百"];
  digits[3] = ["", "壱", "弐", "参", "肆", "伍", "陸", "漆", "捌", "玖", "拾", "佰"];
  digits[4] = ["", "壱", "弐", "参", "肆", "伍", "陸", "漆", "捌", "玖", "拾", "陌"];
  return String(num).replace(/\d+/g,
    function(num){
      var keta = num.length, arr = [], ch = "";
      for (var i = 0; i < keta; i++){
        ch = num.charAt(i);
        if(i == keta - 1 || ch != 1 || one) arr.push(digits[type][ch]);
        if(i < keta - 1 && ch != 0) arr.push(digits[type][keta+8-i]);
      }
      return arr.join("");
    });
}
//タイトル分析
var titlePtn = function(title) {
  var prePtn = "part[ ]?|その|其の|(?:スレ|ｽﾚ)[ 　]?|第|[A-Z]?[a-z]+?\\."; //通し番号の接頭パターン
  var sufPtn = "[^\\d]{1,6}?目|話|th|章"; //通し番号の接尾パターン
  var tmpTitle = title;
  var titleWords = [];
  var countingWord;
  //パターンからスレッド番号の取得
  var rexp = new RegExp("(?:" + prePtn + ")([" + numPtn + "]+)(?:" + sufPtn + ")?"
                   + "|([" + numPtn + "]+)(?:" + sufPtn + ")"
                   + "|[　 ]+([" + numPtn + "]+)[　 ]?$", "i");
  var nums = tmpTitle.match(rexp);
  if(nums && nums.length > 1) {
    nums[1] ? this.num = nums[1] : nums[2] ? this.num = nums[2] : this.num = nums[3];
    countingWord = nums.shift();
  }
  //タイトルの【】または[]内を削除
  tmpTitle = tmpTitle.replace(new RegExp("[\\[【][^]*?[】\\]]", "g"), " ");
  
  //スレッド番号が取得出来なければ一番最後にマッチする番号に
  if(!countingWord) this.num = countingWord = (tmpTitle.match(new RegExp("[" + numPtn + "]+", "g")) || []).pop();
//  if(this.num <= 1) this.num = null;
  //2以上のスレッド番号があれば番号を抜いたスレタイを適当に分割してタイトルパターンに
  if(countingWord) {
    this.count = countingWord;
    this.title = tmpTitle.replace(new RegExp(countingWord + ".*$"), "").replace(/^\s+|\s+$/, '');
  };
}
//通し番号情報
var numType = function(num){
  var hans = toHankakuNum(num);
  this.cur = num; //通し番号
  this.han_cur = hans[0]; //通し番号の半角算用数字
  this.type = hans[1]; //番号の種類(0:半角算用数字, 1:全角算用数字, 2:漢字算用数字, 3:漢数字)
  if (this.han_cur) {
    this.han_prev = this.han_cur - 1; //前スレ通し番号の半角算用数字
    this.han_next = parseInt(this.han_cur) + 1; //次スレ通し番号の半角算用数字
    if (this.type) {
      this.prev = toZenkakuNum(this.han_prev, this.type); //前スレ通し番号
      this.next = toZenkakuNum(this.han_next, this.type); //次スレ通し番号
    } else {
      this.prev = this.han_prev;
      this.next = this.han_next;
    }
  }
}

//検索用URL
var urlList = function(ls, rexp){
  var i = -1;
  var len = ls.length;
  this.general = "";
  this.thread = "";
  this.datNum = "";
  this.idx = 0;
  this.linkLine = function(){
    if (this.idx != i && this.idx < len) {
      var url = String(ls[this.idx])
      this.general = url.replace(/^h/, "");
      var m = url.match(rexp) || [];
      this.datNum = m.pop();
      this.thread = m.pop();
      i = this.idx;
    }
  }
}
//文字比較
function similar(c_str,t_str) {
  var len = c_str.length;
  var threshold = Math.round((len-1)*0.8); //閾値
  for (var m = c = pc = w = 0; m < len; m++) {
    c = t_str.indexOf(c_str.charAt(m), c) + 1;
    if (c != 0) {
      c != pc + 1 ? w = 0 : w++;
      pc = c;
      if(w >= threshold) {
        return true;
      }
    }
  }
  return false;
}
//datからの本文取得
function getOriginalMessage(res){
	return res.source.split('<>')[3].replaceAll('^\s+|\s+$', '').replaceAll(' <br> ','\n').replaceAll('<[^<]+?>','').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
}
//前スレURLの探索
function searchSimilarUrl(nt){
  if(num0.han_cur == 1) return null;//通し番号が1のスレタイの場合各当URLは無し
  var tmpTitle, getTh;
  
  var rexp1 = new RegExp(urlPtn);
  var rexp2 = new RegExp("^.{0,4}前(?:スレ|ｽﾚ|ログ|ﾛｸﾞ|)");
  var rexp3 = new RegExp(cur.count.replace(new RegExp("[" + numPtn + "]+"), "[" + numPtn + "]+"));
  num0.type ? rexp4 = new RegExp((num0.prev).join("|")) : rexp4 = num0.prev;
  var rexp5 = new RegExp(/([ |　]*).+/);
  var rexp6 = new RegExp("^.{0,4}過去(?:スレ|ｽﾚ|ログ|ﾛｸﾞ|)");
  var trim = new RegExp("^\\s+|\\s+$");
  var searchResNum; //URL探索範囲
  nt ? searchResNum = 1 : searchResNum = 5;
  var containsPrevWord = false; //前スレ指定
  var containsSimilarTitle = false; //似たスレタイ
  var containsPrevCount = false //通し番号 - 1
  var containsTitleLine = false; //URLの前にタイトル有り
  var containsPastWord = false; //過去スレ指定
  
  var curTitle = String(cur.title);
  var prevUrl = "";
  var prevTitle = "";
  var tmp_msg = "";
  for (var i = 0, il = th.localResCount; i < searchResNum && i < il; i++) {
    var resObj = th.getRes(i);
    var Links = resObj.links;
    var msg = String(getOriginalMessage(resObj)).replace(new RegExp("\\n*$"), "");
    var msgs = msg.split("\n");
    var url = new urlList(Links, rexp1);
    var prm = 0;
    url.linkLine();
    for (var j = 0, jl = msgs.length; j < jl; j++) {
      if (msgs[j].search(rexp2) != -1) {
        //前スレ表記判定の有効行３まで、過去スレ表記判定も解除
        prm = 3;
        containsPastWord = false;
      } else if (nt && msgs[j].search(rexp6) != -1) {
        //過去スレ判定(リンクの前に「過去スレ、過去ｽﾚ、過去ログ、過去ﾛｸﾞ、過去」)は
        //前スレ表記がでるかレスの最後まで有効[containsPastWord:判定4]
        prm = 0;
        containsPastWord = true;
      }
      //スレッドリンクの行の場合
      if (!containsPastWord && url.thread && msgs[j].indexOf(url.thread) != -1) {
        
        //リンクのタイトルを取得、タイトルが似た表記か否か[containsSimilarTitle:判定1]
        v2c.setStatus("スレッドオブジェクトを取得中・・・");
        getTh = v2c.getThread(Links[url.idx]);
        v2c.setStatus("スレッドオブジェクトを取得");
        if (getTh && getTh.title) {
          tmpTitle = String(getTh.title).replace(trim, '');
          if(String(msgs[j-1]).replace(trim, '') == tmpTitle) containsTitleLine = true;
          containsSimilarTitle = similar(curTitle, tmpTitle);
        } else {
          tmpTitle = String(msgs[j-1]).replace(trim, '');
          containsSimilarTitle = containsTitleLine = similar(curTitle, tmpTitle);
        }
        
        //リンクの前に「前スレ、前ｽﾚ、前ログ、前ﾛｸﾞ、前」が3行以内に指定してあるか否か[containsPrevWord:判定2]
        containsPrevWord = prm > 0;
        
        //通し番号 - 1か否か[containsPrevCount:判定3]
//        var ns = String(tmpTitle.match(rexp3)).search(rexp4); //接頭接尾含む番号、厳しめ
        var ns = tmpTitle.search(rexp4); //番号のみ、緩め
        if(ns != -1 || ns == -1 && num0.han_prev == 1) containsPrevCount = true;
        //前スレが指定されているか、派生タイトルと通し番号が見つかった場合、前スレURLとする。
        if (containsPrevWord || (containsSimilarTitle && containsPrevCount)) {
          if (nt) {
            //URLの置換
            prevUrl = msgs[j];
            url.general = msgs[j].replace(rexp1, defaultUrl);
            msgs[j] = url.general;
            //スレタイがあれば置換
            if (prm == 1 || containsTitleLine) {
              prevTitle = msgs[j-1];
              msgs[j-1] = msgs[j-1].replace(rexp5, "$1"+defaultTitle);
            }
            if(nt) return msgs.join("\n");
          } else {
            return Links[url.idx];
          }
        }
        containsSimilarTitle = false;
        containsPrevCount = false;
      }
      prm--;
      while(url.general && msgs[j].indexOf(url.general) != -1) {
        url.idx++;
        url.linkLine();
        if(url.idx > 60) break;
      }
    }
    containsPastWord = false;
  }
}
if (th && res) {
  var one_resObj = th.getRes(0);
  var resIdx = res.index;
  var prevResOpt = options[0] == "prevres" || options[1] == "prevres";
  var newTabOpt = options[0] == "newtab" || options[1] == "newtab";
  var newthread = options[0] == "newthread";
  if (resIdx != 0 && prevResOpt) {
    vcx.setResIndexToJump(resIdx - 1);
  } else {
    var cur = new titlePtn(defaultTitle);
    var nextMessage = "";
    if(!cur.num) {
      nextMessage = getOriginalMessage(th.getRes(0)) + "\n\n前スレ\n" + defaultTitle + "\n" + defaultUrl;	
      vcx.setStatusBarText("通し番号が見つかりませんでした。前スレURLを追加しました。");
      var num0 = new numType(String(1));
    } else if(cur.num.search(/^(1|１|一|壱)$/) == 0){
      nextMessage = getOriginalMessage(th.getRes(0)) + "\n\n前スレ\n" + defaultTitle + "\n" + defaultUrl;
      vcx.setStatusBarText("最初のスレッドです。前スレURLを追加しました。");
      var num0 = new numType(String(cur.num));
    } else {
      var num0 = new numType(String(cur.num));
      if(newthread){
        var msg = searchSimilarUrl(newthread);
        if(msg) {
          nextMessage = msg;
          vcx.setStatusBarText("前スレURLを現スレに置換しました。");
        } else {
          nextMessage = getOriginalMessage(th.getRes(0));
//          vcx.setStatusBarText("置換に失敗しました。前スレ用に次の文をコピーしました。   "+defaultTitle+"【改行】"+defaultUrl);//ステータス表示
//          if (v2c.confirm("置換に失敗しました。前スレ用に以下の文をコピーしますか？\n\n"+defaultTitle+"\n"+defaultUrl))//選択ダイアログ(OKでコピー)
          v2c.alert("置換に失敗しました。前スレ用に以下の文をコピーしました。\n\n"+defaultTitle+"\n"+defaultUrl);//ダイアログ
          vcx.setClipboardText(defaultTitle + '\n' + defaultUrl); //実行したスレッドタイトルとそのURLをコピー
//          newthread = false;
        }
      } else {
        var url = searchSimilarUrl(newthread);
        if (url) {
          var prevTh = v2c.getThread(url);
          var resCount = prevTh.resCount;
          var local_resCount = prevTh.localResCount;
          var gettable_resCount = resCount - local_resCount;
          var update = false;
          if (resCount == 0 || gettable_resCount > 0)
            update = true; //ログ無し、未取得レス有で前スレを更新
          if (prevResOpt)
            url += resCount;
          v2c.openURL(url, update, newTabOpt);
          vcx.setStatusBarText(prevTh.title);
        } else {
          vcx.setStatusBarText("前スレURLが見つかりませんでした。");
        }
      }
    }
    if(newthread) {
      var nextTitle ="";
      if(cur.num) {
        var rexp = new RegExp("("+cur.count.replace(new RegExp("([" + numPtn + "]+)"), ")$1(") + "[^" + numPtn + "]*?)");
        if(num0.next.length > 1) {
          nextTitle = defaultTitle.replace(rexp, "$1("+num0.next.join("|")+")$2");
        } else {
          nextTitle = defaultTitle.replace(rexp, "$1"+num0.next+"$2");
        }
      } else {
        nextTitle = defaultTitle + " 2";
      }
      var bd = th.board;
      var wp = bd.openWritePanel();
      wp.title.text = nextTitle;
      wp.message.text = nextMessage;
    }
  }
}
// ----- 前の行まで -----