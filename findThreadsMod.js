//【登録場所】お気に入り、ツールバー
//【ラベル】検索キーワード名＠板名 など
//【コマンド】${SCRIPT:SFr} findThreadsMod.js $QUERY(検索用キーワード) $BOARD(板URL又は板key)
//【アクション】スレ一覧で開く ←※忘れやすいんで設定し忘れに注意
//【更新日】2014/05/17 コマンドの引数が正常に動かないケースがある不具合の修正
//          2013/02/02 初版
//【内容】 板・既得ログ・過去ログ倉庫からキーワードを含むスレを抽出してスレ一覧に表示
// ▼コマンドの記述方法
// ${SCRIPT:SFr} findThreadsMod.js 引数１ 引数２ 引数３ ... (以下の引数を半角スペースを空けて連続して書く。)
// ▼引数一覧
// $VIEWONLY = スレ一覧を更新しない
// $BOARD(板URL又は板key) = 抽出対象の板の識別キー(news4vipみたいな)か、板URL(http://hayabusa.2ch.net/news4vip/みたいな) ※必須
// $QUERY(検索用キーワード) = 抽出したいスレタイ ※QUERYかREGQUERYのいずれかが必須
// $REGQUERY(検索用正規表現) = $QUERYの正規表現版
// $KAKO = 過去ログ倉庫からも探してくる(遅い)
// ▼コマンド記述例
// 例：${SCRIPT:SFr} findThreadsMod.js $QUERY(妹) $BOARD(http://hayabusa.2ch.net/news4vip/)
//     ↑VIPの板・既得ログから"妹"と付くスレをスレ一覧に表示する
// 例：${SCRIPT:SFr} findThreadsMod.js $REGQUERY((V2C|Jane|2chブラウザ)) $BOARD(software) $KAKO
//     ↑ソフトウェア板の板・既得ログ・過去ログ倉庫から"V2C"、Jane、2chブラウザのいずれかが付くスレをスレ一覧に表示する
// 例：${SCRIPT:SFr} findThreadMod.js $QUERY(ガンプラ) $BOARD(http://may.2chan.net/b/) $VIEWONLY
//     ↑ふたばの過去ログから"ガンプラ"と付くスレをスレ一覧に表示する。 ※$VIEWONLYを外すと動作しません。※ふたばスクリプト導入済みの場合のみ
//【スクリプト】
function getThreads(cx) {
	if (!v2c.online) { cx.skip = true; return null; }
	var KAKO = false;
	var QUERY = null;
	var REGQUERY = null;
	var BOARD = null;
	var VIEWONLY = false;
	if (v2c.context.args.length > 0) {
		var tmp = String(v2c.context.argLine);
		var matches = [];
		KAKO = /\$KAKO/i.test(tmp);
		VIEWONLY = /\$VIEWONLY/i.test(tmp);
		if (matches = /\$QUERY\((.*?)\) *(?:\$|$)/i.exec(tmp)) {
			if (matches[1].length == 0) { statusLog('$QUERY(スレタイ検索用キーワード)の「スレタイ検索キーワード」に何も入力されていません。'); return null; }
			QUERY = matches[1];
		}
		if (matches = /\$REGQUERY\((.*?)\) *(?:\$|$)/i.exec(tmp)) {
			if (matches[1].length == 0) { statusLog('$QUERY(スレタイ検索用キーワード)の「スレタイ検索キーワード」に何も入力されていません。'); return null; }
			REGQUERY = new RegExp(matches[1]);
		}
		if (matches = /\$BOARD\((.*?)\) *(?:\$|$)/i.exec(tmp)) {
			if (matches[1].length == 0) { statusLog('$BOARD(板URL又は板key)の「板URL又は板key」に何も入力されていません。'); return null; }
			BOARD = v2c.getBoard(matches[1]);
			if (!BOARD) {
				BOARD = v2c.bbs2ch.getBoard(matches[1]);
			}
			if (!BOARD) { statusLog('板オブジェクトの取得に失敗。({0})', BOARD); return null; }
			if (BOARD.twitter) { statusLog('Twitterは非サポートです。({0})', BOARD); return null; }
		}
	}
	if (!((QUERY || REGQUERY) && BOARD)) { statusLog('$QUERY(スレタイ検索用キーワード) と $BOARD(板URL又は板key) は必須です。'); return null; }
	var queryfunc = null;
	if (QUERY) {
		queryfunc = function(q) { return (q.indexOf(QUERY) != -1); };
	} 
	if (REGQUERY) {
		queryfunc = function(q) { return REGQUERY.test(q); };
	}
	// 板欄の更新
	if (!VIEWONLY) {
		v2c.openURL(BOARD.url, true, true, true);
	}
	// 現板のsubject.txtと既得スレッド
	var sul = [], thluq = {};
	var results = [], logs = BOARD.threadsWithLog;
	sul.push(BOARD.url + 'subject.txt');
	// 過去ログ倉庫のsubject.txt
	if (KAKO && BOARD.bbs.is2ch) {
		var su = BOARD.url + 'kako/';
		var sk = v2c.readURL(su);
		if (v2c.interrupted) { return null; }
		if (!sk) { statusLog('過去ログ倉庫の取得に失敗。({0})', su); return null; }
		var matches = [];
		while (matches = /<A HREF="(o\d+\/subject\.txt)">/gi.exec(sk)) { sul.push(su + matches[1]); }
	}
	// プログレスバーの設定
	cx.progress = 0;
	cx.maxProgress = 100000;
	var sulscore,thstscore;
	if (KAKO) {
		// kako付きならsubject.txtリスト50%,既得ログ50%ずつmaxProgressを割り振る
		sulscore = (cx.maxProgress / 2) / sul.length;
		thstscore = (cx.maxProgress / 2) / logs.length;
	} else {
		sulscore = thstscore = cx.maxProgress / (logs.length + sul.length);
	}
	// 既得スレッドからQUERYのスレを検索
	for (var i = logs.length - 1; i >= 0; i--) {
		if (queryfunc(logs[i].title)) {
			if ((!VIEWONLY) && logs[i].live && (logs[i].resCount - logs[i].localResCount) > 0) {
				logs[i].updateAndWait();
			}
			results.push(logs[i]);
			thluq[logs[i].key] = true;
		}
		cx.progress += thstscore;
	}
	if (!VIEWONLY) {
		// subject.txtからkeywordのスレを検索
		var sepStart = '<>', sepLast = ' (';
		if (BOARD.bbs.shitaraba || BOARD.bbs.match) {
			sepStart = ',';
			sepLast  = '(';
		}
		for (var i = sul.length - 1; i >= 0; i--) {
			var ss=v2c.readURL(sul[i]);
			if (v2c.interrupted) { return null; }
			if (!ss) { statusLog('subject.txtの取得に失敗。({0})', sul[i]); return null; }
			var lines = ss.split('\n');
			var start, last, title, key, num, th;
			for (var n = lines.length - 1; n >= 0; n--) {
				key   = lines[n].substring(0, lines[n].indexOf('.'));
				if (thluq[key]) { continue; }
				start = lines[n].indexOf(sepStart) + sepStart.length;
				last  = lines[n].lastIndexOf(sepLast);
				title = lines[n].substring(start, last).split('&lt;').join('<').split('&gt;').join('>').split('&amp;').join('&');
				if (queryfunc(title)) {
					num = lines[n].substring(last + sepLast.length, lines[n].length() - 1); 
					th  = BOARD.getThread(key, BOARD.url, title, num);
					if (th) {
						if (th.live && (th.resCount - th.localResCount) > 0) {
							th.updateAndWait();
						}
						results.push(th);
						thluq[key] = true;
					}
				}
			}
			cx.progress += sulscore;
		}
	} else {
		cx.progress = cx.maxProgress;
	}

	// スレ立て降順にソート
		results.sort (
			function (a, b) {
				if (a.key < b.key) return 1;
				if (a.key > b.key) return -1;
				return 0;
			}
		);
	return results;
}
function statusLog(format /*, ...*/)
{
		var args = arguments;
		var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1] });
		v2c.context.setStatusBarText("[findThreadsMod.js] " + message);
}
function printlnLog(format /*, ...*/)
{
		var args = arguments;
		var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1] });
		v2c.println("[findThreadsMod.js] " + message);
}