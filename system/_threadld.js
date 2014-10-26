//【登録場所】 "V2C\script\system\threadld.js"
//【内容】threadld.jsのまとめ
//【備考】threadUpdatedとpanelCreatedの{}内で、行頭のコメント「//」を、利用する行ごとに解除することで、有効になります。
//【更新日】2014/04/04 sofTalkの追加
//          2014/03/31 getMachiKakologの追加
//          2013/11/24 guroNGの追加
//【スクリプト】
// ----- 次の行から -----
/* スレッドの更新が完了した時に実行するスクリプト */
function threadUpdated(th, cx) {
/* 機能を有効にしたい場合、下の各行頭//を削除してください  */
//  egnoreNewNGRes(th, cx); //新着がNGのみの場合、未読状態を解除
//  redirectNewsThread(th, cx); //速報headlineスレを開くと本スレにリダイレクト ※パーミッションにSを追加してください ※速報headlineスレのログは削除されません。
//  redirectLiveThread(th, cx); //テレビ番組欄のスレを開くと一番勢いのあるスレッド(恐らく本スレ)にリダイレクト ※パーミッションにSを追加してください ※テレビ番組欄スレのログは削除されません。
//  idConditionalNG(th, cx); //閾値以上書き込みIDをNG判定(デフォルトはニュー速と嫌儲で有効)
//  checkNewTanpatsuNG(th, cx); //新着レスを対象に単発IDのレスを非表示にする。（デフォルトは実況カテゴリで有効）
//  guroNG(th, cx); //グロアンカーのついたレスが画像リンクを持っていた場合透明NGに指定
//  getMachiKakolog(th, cx);  // まちBBSでdat落ちの場合mimizunから過去ログ取得試みます。※取得に成功すると自動でスレを閉じますが閲覧するにはその後手動でスレを開く必要があります。
//  sofTalk(th, cx);			// SofTalkでスレッドを読み上げます。※下部の470行あたりfunction softTalk(th, cx) 以下の設定項目があります
}

/* レス表示タブを作成した時に実行するスクリプト */
function panelCreated(th) {
/* 機能を有効にしたい場合、下の各行頭//を削除してください  */
//  openWritePanel(th); //開いたスレが2chの場合、書き込みパネルを自動で開く
//  openFixedColumn(th); //常に特定のカラムで開く（デフォルトは0カラム）
//  groupThreadPanel(th); //2カラムの状態で、特定の板（デフォルトは実況カテゴリとTwitter）を特定のカラム（デフォルトは0カラム）で開く
}

/* 関数名を添えてスクリプトコンソール出力
使用例 printFunc(arguments.callee, "要素１は「{0}」です。", 100); */
function printFunc(func, format /*, ...*/)
{
  var args = arguments;
  var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 2]; });

  if (func && (typeof func == 'function')) {
    v2c.println("[threadld.js : " + func.name + "()] " + message);
  } else {
    v2c.println("[threadld.js]" + message);
  }
}

/* ここから各機能 */
function egnoreNewNGRes(th, cx) {
  var newResi = th.localResCount - cx.numNewRes;
  for (var i = newResi; i < th.localResCount; i++) {
    var res = th.getRes(i);
    if (res && !res.ng) {
      return;
    }
  }
  th.resetUnread();
}

function redirectLiveThread(th, cx) {
// ―┤設定項目ここから├―――――――――――――――――――――――――――――――――――――――――――
  // [設定項目] スレタイから番組名を除外した部分を対象に以下の正規表現でマッチした場合除外する。
  var DENY_WORDS = new RegExp("(ﾏﾀｰﾘ|マターリ|酒|sage)", "i");
  // [設定項目] スレと一緒に板一覧を開く場合はture開かない場合はfalse
  var BOARDVIEW = true;
  // [設定項目/BOARDVIEW=trueの時のみ有効] スレのDAT落ち扱いを回避するためにスレ取得開始まで一定時間(ミリ秒単位)待つ (スレ一欄と同期が取れない為。スレ一欄が更新完了するまでの時間を入力)
  var THUPDATE_WAIT = 500;
  // [設定項目] スクリプトコンソールに比較文字列を出力する(一致具合検証用) 出力する場合はtrueしない場合はfalse
  var OUTPUT_COMPARE = false;
  // [設定項目] 比較関数の閾値。この値以上のスコアになったスレは除外する
  var threshold = 16;
  // [設定項目] 番組名とスレタイに比較前に補正を掛けて一致しやすくする
  var PRE_FUNC = (function(name) {
  	var ret = { 'value' : '', 'deny' : '' };
    //カッコを削除(DEBY_WORDSの場合は残す
    var tname =  name.replace(/[\[\(\<【（｛＜［《〔][^\]\)\>】）｝」』＞］》〕]+[\]\)\>】）｝＞］》〕]/g, ''); // カッコの種類の「『 はタイトルに使われる場合があるので除外 
    if (tname.length < name.length && DENY_WORDS.test(name)) {
      ret.deny = RegExp.$1;
    }
    name = tname;
    //全角英数字を半角に
    name = name.replace(/[！-～]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    //半角英数字をと日本語以外は削除。小文字を大文字に
    name = name.replace(/[^一-龠ぁ-んァ-ヴa-zA-Z0-9\r\n]/ig, '').toUpperCase();

    var hanKana = ['ｶﾞ', 'ｷﾞ', 'ｸﾞ', 'ｹﾞ', 'ｺﾞ', 'ｻﾞ', 'ｼﾞ', 'ｽﾞ', 'ｾﾞ', 'ｿﾞ', 'ﾀﾞ', 'ﾁﾞ', 'ﾂﾞ', 'ﾃﾞ', 'ﾄﾞ', 'ﾊﾞ', 'ﾊﾟ', 'ﾋﾞ', 'ﾋﾟ', 'ﾌﾞ', 'ﾌﾟ', 'ﾍﾞ', 'ﾍﾟ', 'ﾎﾞ', 'ﾎﾟ', 'ｳﾞ',
    'ｧ', 'ｱ', 'ｨ', 'ｲ', 'ｩ', 'ｳ', 'ｪ', 'ｴ', 'ｫ', 'ｵ', 'ｶ', 'ｷ', 'ｸ', 'ｹ', 'ｺ', 'ｻ', 'ｼ', 'ｽ', 'ｾ', 'ｿ', 'ﾀ', 'ﾁ', 'ｯ', 'ﾂ', 'ﾃ', 'ﾄ', 'ﾅ', 'ﾆ', 'ﾇ', 'ﾈ', 'ﾉ', 'ﾊ', 'ﾋ', 'ﾌ', 'ﾍ',
    'ﾎ', 'ﾏ', 'ﾐ', 'ﾑ', 'ﾒ', 'ﾓ', 'ｬ', 'ﾔ', 'ｭ', 'ﾕ', 'ｮ', 'ﾖ', 'ﾗ', 'ﾘ', 'ﾙ', 'ﾚ', 'ﾛ', 'ﾜ', 'ﾜ', 'ｦ', 'ﾝ', '｡', '｢', '｣', '､', '･', 'ｰ', 'ﾞ', 'ﾟ'];
    var zenKana = 'ガギグゲゴザジズゼゾダヂヅデドバパビピブプベペボポヴァアィイゥウェエォオカキクケコサシスセソタチッツテトナニヌネノハヒフヘホマミムメモャヤュユョヨラリルレロワワヲン。「」、・ー゛゜';
    var zenHira = 'がぎぐげござじずぜぞだぢづでどばぱびぴぶぷべぺぼぽヴぁあぃいぅうぇえぉおかきくけこさしすせそたちっつてとなにぬねのはひふへほまみむめもゃやゅゆょよらりるれろわわをん。「」、・ー゛゜';
    //全角カタカナひらがなを半角カタカナに
    name = name.replace(/[ぁ-んァ-ヴ「」、・ー゛゜]/g, function(s) {
      var n = zenKana.indexOf(s);
      if (n != -1) { return hanKana[n]; }
      n = zenHira.indexOf(s);
      if (n != -1) { return hanKana[n]; }
      return '';
    });
    ret.value = name;
    return ret;
  });
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――

  if (!cx.error && th.board.key.startsWith('tv2chwiki')) {
    var tmp = th.getRes(0);
    var bd = v2c.getBoard(tmp.links[0]);
    if (!bd) { printFunc(arguments.callee, "{0}の取得に失敗", bd); return false; }
    tmp = String(tmp.message).split('\n');
    if ((!tmp) || tmp.length <= 0) { printFunc(arguments.callee, "{0}の>>1の本文の取得に失敗", th); return false; }
    // ヒット率を上げるために全角スペースで区切ってループ判定（その分誤判定も増える。元のロジックに戻した場合は見つからなかったで終わり）
    var rawtitle = tmp[1];
    var ss = v2c.readURL(bd.url + 'subject.txt');
    if (v2c.interrupted) { return false; }
    if (!ss) { printFunc(arguments.callee, "{0}の取得に失敗", bd); return false; }
    var lines = ss.split('\n');
    var now = Math.floor((new Date()).getTime() / 1000);
    var maxmatches = [];
    printFunc(arguments.callee, "【リダイレクト先の検索開始】番組名：{0}", rawtitle);
    var title = PRE_FUNC(rawtitle);
    for (var i = 0; i < lines.length; i++) {
      if (/^(\d+)\.dat<>(.+) \((\d+)\)/.test(lines[i])) {
        var current = RegExp.$1;
        var name = RegExp.$2;
        var resnum = RegExp.$3;
        var speed = parseInt(resnum) / ((now - parseInt(current)) / 86400)
        tmp = PRE_FUNC(name);
        if (OUTPUT_COMPARE) {
          v2c.println(title.value + '\t=\t' + tmp.value);
        }
        if (tmp.deny) {
          printFunc(arguments.callee, "DENY_WORDS「{1}」にヒットしたので「{0}」を除外します。", tmp.deny, name);
          continue;
        }
        var score = levenshtein(title.value, tmp.value);
        if (score >= threshold) {
          maxmatches.push({'speed': speed, key: current, 'title': name, 'resnum': parseInt(resnum), 'score' : score});
        }
      }
    }
    if (maxmatches.length > 0) {
      // 1001に達していないなるべく古いスレを優先する。見つからない場合は1001しかない=新スレが立ってないってことで最も新しいスレを返す
      // スレ立て時間昇順
      maxmatches.sort(function(a, b) { 
        if (a.score === b.score) { return parseInt(a.key) - parseInt(b.key); }
        else return a.score - b.score;
      });
      var max = maxmatches[maxmatches.length - 1]; // 最後に立ったスレを入れとく
      for (var i = 0; i < maxmatches.length; i++) {  
        if (maxmatches[i].resnum == 1001) { continue; }
        max = maxmatches[i];
        break;
      }
      printFunc(arguments.callee, "【検索終了。スレッドの取得を試みます】スレタイ名：{0} ", max.title);
      var u = new java.net.URL('http://' + bd.url.getHost() + '/test/read.cgi/' + bd.key + '/' + max.key + '/');
      if (BOARDVIEW) {
        v2c.openURL(bd.url);
        java.lang.Thread.sleep(THUPDATE_WAIT);
        v2c.openURL(u, true, false, false);
        return true;
      } else {
        var th2 = bd.getThread(max.key, bd.url, max.title, max.resnum);
        if (th2) {
          th2.open(true, false, false);
          return true;
        } else {
          printFunc(arguments.callee, "【スレッドの取得に失敗したのでスレ一覧を開きます】番組名 : {0}", rawtitle);
          v2c.openURL(bd.url);
        }
      }
    } else {
      printFunc(arguments.callee, "【スレッドを見つけられなかったのでスレ一覧を開きます】番組名 : {0}", rawtitle);
      v2c.openURL(bd.url);
    }
  }
}
// 文字列の類似比較用距離関数
function levenshtein(s1, s2) {
    // http://kevin.vanzonneveld.net
    // +            original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // +            bugfixed by: Onno Marsman
    // +             revised by: Andrea Giammarchi (http://webreflection.blogspot.com)
    // + reimplemented by: Brett Zamir (http://brett-zamir.me)
    // + reimplemented by: Alexander M Beedie
    // *                example 1: levenshtein('Kevin van Zonneveld', 'Kevin van Sommeveld');
    // *                returns 1: 3

    if (s1 == s2) {
        return 0;
    }

    var s1_len = s1.length;
    var s2_len = s2.length;
    if (s1_len === 0) {
        return s2_len;
    }
    if (s2_len === 0) {
        return s1_len;
    }

    // BEGIN STATIC
    var split = false;
    try{
        split=!('0')[0];
    } catch (e){
        split=true; // Earlier IE may not support access by string index
    }
    // END STATIC
    if (split){
        s1 = s1.split('');
        s2 = s2.split('');
    }

    var v0 = new Array(s1_len+1);
    var v1 = new Array(s1_len+1);

    var s1_idx=0, s2_idx=0, cost=0;
    for (s1_idx=0; s1_idx<s1_len+1; s1_idx++) {
        v0[s1_idx] = s1_idx;
    }
    var char_s1='', char_s2='';
    for (s2_idx=1; s2_idx<=s2_len; s2_idx++) {
        v1[0] = s2_idx;
        char_s2 = s2[s2_idx - 1];

        for (s1_idx=0; s1_idx<s1_len;s1_idx++) {
            char_s1 = s1[s1_idx];
            cost = (char_s1 == char_s2) ? 0 : 1;
            var m_min = v0[s1_idx+1] + 1;
            var b = v1[s1_idx] + 1;
            var c = v0[s1_idx] + cost;
            if (b < m_min) {
                m_min = b; }
            if (c < m_min) {
                m_min = c; }
            v1[s1_idx+1] = m_min;
        }
        var v_tmp = v0;
        v0 = v1;
        v1 = v_tmp;
    }
    return v0[s1_len];
}
function redirectNewsThread(th, cx) {
  if (!cx.error && th.board.key.match(/(bbynews|bbylive|bbynamazu|bbylunch)/)) {
    var u = th.getRes(1).links[0];
    v2c.openURL(u,true,false,false);
  }
}
function openWritePanel(th) {
  if (
      th.bbs.is2ch
      /* 2ｃｈ以外でも有効にしたい場合、下の各行頭//を削除してください  */
      //  || th.bbs.is2cheq　//BBSが2ch互換板の場合
      //  || th.bbs.shitaraba　//BBSがしたらばの場合
      //  || th.bbs.machi　//BBSがまちBBSの場合
      //  || th.bbs.twitter　//BBSがTwitterの場合
      ) {
    th.mayOpenWritePanel();
  }
}
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

// IDのNG判定
function idConditionalNG(th, cx) {
  /* 設定 */
  // idCountがこの値を超えたらそのIDをNG 初期値20
  var threshold = 20;
  // trueなら透明NGID、falseなら通常NGID
  var set_t = false;
  // NG登録後全てのレス表示タブのスレッドでも再チェックさせるならtrue,そうでないならfalse
  // 重いようならfalseにしてそのスレだけで再チェック
  var rechk_rp = false;
  // IDの長さがこの値を超えたらチェック対象にする
  var inflen = 7;
  // 実行する対象URL、スレURLに含まれるか(th.url.toString().indexOf() > 0)を
  // チェックするので ".2ch.net/test/read.cgi/news/" という風に
  // 複数あるときは , で区切る
  // 2chすべての板を対象にするなら ".2ch.net/test/read.cgi/" など
  // すべてを対象にするなら "." など
  // ↓は既にニュー速と嫌儲を登録、必要ないなら削除
  var target = [
    ".2ch.net/test/read.cgi/news/",
    ".2ch.net/test/read.cgi/poverty/",
  ];
  // プラットフォームごとの闘値機能を有効にするならtrue、そうでないならfalse
  var xtargetThresholdsEnabled = true;
  // プラットフォームごとの闘値 初期値20
  var xtargetThresholds = {
    'O' : 20,             // 携帯
    'o' : 20,             // WiLLCOMの一部機種
    'I' : 20,             // iPhone
    'i' : 20,             // iPhone
    'P' : 20,             // p2.2ch.netからの投稿
    '0' : 20,             // PC, wifi経由等
  };
  /* 設定終わり */
  if(!cx.error && cx.numNewRes > 0 && checkThStr(th.url.toString(), target)) {
    var srtnum = th.localResCount - cx.numNewRes;
    var res, i;
    var rflag = false;
    for (i=srtnum; i<th.localResCount; i++) {
      res = th.getRes(i);
      if (res != null && !res.ng && res.id && res.id.length() > inflen) {
        if (xtargetThresholdsEnabled && res.id.length() == 9) {
          var thresTmp = xtargetThresholds[String(res.id).charAt(8)];
          if (thresTmp != undefined && res.idCount > thresTmp) {
            res.addNGID(set_t);
            rflag = true;
          }
          continue;
        }
        if (res.idCount > threshold) {
          res.addNGID(set_t);
          rflag = true;
        }
      }
    }
    // 追加があったら再チェック
    if (rflag) {
      v2c.resPane.checkNG(th);// ←重いようならth.boardをthにしてそのスレだけで再チェック
    }
  }
}
// 新着レスを対象に単発IDのレスを非表示にする。
// 既にNGとなっている場合はNGラベルの見分けがつくように何もしない。
// [through]
//   単発でもスルーするレスの範囲（through=50で>>1-50のレスを飛ばす。）
function setNewTanpatsuNG(th, cx, through) {
  var lrc = th.localResCount
  var format = '非表示の単発IDｽｶｳﾀｰ: '
  var scouter = 0

  for ( var i = lrc - cx.numNewRes; i < lrc; i++ ) {
    if ( i < through ) continue;

    var res = th.getRes( i )
    if ( res && res.idCount == 1 && !res.ng ) {
      res.setNGRes()
      scouter++
      v2c.setStatus( format + scouter )
    }
  }
}
function checkNewTanpatsuNG( th, cx ) {
  var target = [ //実況カテゴリ
    'live',
    'endless',
    'weekly',
    'kokkai',
    'dome',
    'oonna',
    'ootoko',
    'dancesite',
    'festival',
    'jasmine',
  ];
  var targetTanpatsu = /Firefox|Google/i

  if ( cx.numNewRes > 0 ) {
    if ( th.bbs.is2ch && checkThStr(th.board.key, target) ) {
      setNewTanpatsuNG( th, cx, 75 );
    } else if ( targetTanpatsu.test( th.title ) ) {
      setNewTanpatsuNG( th, cx,  1 );
    }
    egnoreNewNGRes( th, cx )
  }
}

function openFixedColumn(th) {
  /* 設定 */
  var index = 0;//スレッド開くときに常に使用するカラムIndex
  /* 設定ここまで */
  
  if (th.columnIndex>index) {
    th.movePanelTo(index, -1);
    th.open(false, false, false);//移動した後表示
  }
}
function groupThreadPanel(th) {
  /* 設定 */
  var target = [ //実況カテゴリ
    'live',
    'endless',
    'weekly',
    'kokkai',
    'dome',
    'oonna',
    'ootoko',
    'dancesite',
    'festival',
    'jasmine',
  ];
  var targetIndex = 0;//target1の場合に開くColumnIndex
  var otherIndex = 1;//target以外で開くColumnIndex
  /* 設定ここまで */

  if (th.bbs.is2ch && checkThStr(th.board.key, target) || th.bbs.twitter) {
    if (th.columnIndex != targetIndex) {
      th.movePanelTo(targetIndex, -1);
      th.open(false, false, false);//移動した後表示
    }
  } else {
    if (th.columnIndex != otherIndex) {
      th.movePanelTo(otherIndex, -1);
      th.open(false, false, false);//移動した後表示
    }
  }
  
}

function guroNG(th, cx)
{
	for (var i = (th.localResCount - cx.numNewRes); i < th.localResCount; i++) {
		var res = th.getRes(i);
		var decision = false;
		if (res && res.refResIndex && res.refResIndex.length > 0 && res.links.length > 0) {

			for (var j = 0; j < res.refResIndex.length; j++) {
				decision = (th.getRes(res.refResIndex[j]).message.indexOf('グロ') >= 0) ? true : decision;
			}
		}
		if (decision) v2c.println('[threadld.js:guroNG()] レスNo.' + res.number + ' をグロと断定して透明NGしました。');
		if (decision) res.setNGRes(true);
	}
}

function getMachiKakolog(th, cx)
{
	var url = String(th.url);
	if (url.indexOf('machi.to') < 0 || th.live || th.localResCount > 0) return;
	var result = false;
	try {
		var src1 = new RegExp("^http://([^\\.]+)\\.machi\\.to/bbs/[^/]+/(\\w+)/(\\d+).*");
		var src2 = new RegExp("^http://([^\\.]+)\\.machi\\.to/bbs/read.pl\\?BBS=(\\w+)&KEY=(\\d+).*");
		var dst  = "http://mimizun.com/log/machi/$2/$3.dat";
		var url2 = url.replace(src1, dst).replace(src2, dst);
		if (url != url2) {
			var dat = v2c.readURL(url2);
			if (dat) {
				var lines = dat.split('\n');
				var num = lines.length;
				var fields = lines[0].split('<>');
				
				var title = String(fields[5]);
				if (fields.length < 7) {
					for (var i = 0; i < lines.length; i++) {
						lines[i] = String(lines[i]).replace(/ <font size=1>\[ ([^ ]*) \]<\/font>/, '') + '<>' + RegExp.$1;
					}
					dat = lines.join('\n') + '\n';
				}
				if (num > th.resCount) {
					v2c.writeLinesToFile(th.localFile, lines, 'MS932');
					th.close();
					result = true;
				}
			}
		}
	} 
	finally {
		if (result) v2c.println('[threadld.js:getMachiKakolog()] mimizunからまちBBSスレ(' + th.key + ')を取得しました。');
		else v2c.println('[threadld.js:getMachiKakolog()] mimizunからまちBBSスレ(' + th.key + ')を取得出来ませんでした。');
	}
}

function sofTalk(th, cx)
{
// --- 設定ここから --------------------------------------------------
	/* [設定項目] SofTalk.exeのフルパスを指定して下さい フォルダ区切り文字「\」は「\\」または「/」で入力して下さい */
	var exe = 'D:/UserData/Dropbox/softalk/softalkw.exe';

// --- 設定ここまで --------------------------------------------------
	var config = new java.io.File(v2c.saveDir + '/script/scdata/softalk.settings');
	if (config.exists()) {
		var tmp = v2c.readStringFromFile(config);
		if (/^Enable = 0$/i.test(tmp)) {
			return;
		}
	}
	
	var startIdx = th.localResCount - th.newResCount;
	var pname = exe.replace(/^.*[\\|\/]/, '');
	
	for (var i = startIdx; i <= th.localResCount; i++) {
		var res = th.getRes(i);
		if (res && res.message) {
			if (res.date == 'Over 1000 Thread')
				break;
			if (v2c.getProperty('Softalk_Skip') == 1) {
				v2c.putProperty('Softalk_Skip', 0);
				return;
			}
			var mes = res.number + '　' + res.message.replace('\n', '　');
			
			v2c.exec([exe, '/X:1', '/W:' + mes]);
			
			while (isProcessRunning(pname)) {
				java.lang.Thread.sleep(1000);
			}
		}
	}
	
	function isProcessRunning(processName)
	{
		var cnt = 0;
		try {
			var runtime = java.lang.Runtime.getRuntime();
			var p;
			var OS = java.lang.System.getProperty("os.name").toLowerCase();
			if (OS.indexOf('win') >= 0) {
				p = runtime.exec(['cmd.exe', '/c', 'tasklist | findstr "' +processName + '"']);
			} else {
				p = runtime.exec(['/bin/sh', '-c', 'ps ux | pgrep -lf "' + processName + '"']);
			}
			var is = p.getInputStream();
			var isr = new java.io.InputStreamReader(is);
			var br = new java.io.BufferedReader(isr);
			while (br.readLine()) { cnt++; }
			
			br.close();
			isr.close();
			is.close();
		} catch (e) {
			if (e.javaException) {
				printlnLog('プロセス名の取得に失敗しました。 ({0})', e.javaException);
			} else {
				printlnLog('プロセス名の取得に失敗しました。 (e={0})', e);
			}
		}
		return (cnt)? true : false;
	}
}