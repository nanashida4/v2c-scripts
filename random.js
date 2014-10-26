//【登録場所】レス表示、全体
//【ラベル】ランダムで開く
//【更新日】2013/01/25 (version 1.11 stable)
//【コマンド】${SCRIPT:S} random.js
//【コマンド】${SCRIPT:S} random.js $BOARDBASE
//【コマンド】${SCRIPT:S} random.js $BOARDBASE $BOARDVIEW
// コマンドの書式
//    ${SCRIPT:S} random.js 引数1 引数2 (半角スペースを開けて以下の引数を書く)
//    ■引数 $BOARDBASE … 以下のbdlistの板の中からランダムで開くようにする
//    ■引数 $BOARDVIEW … ランダムに選択したスレを開く前にそのスレの板(スレ一覧)を開きます
//【内容】 レスビューで開いているスレの板(スレ一覧)からランダムにスレ開く
//【スクリプト】
// [設定]____________________________________
var bdlist = [
	"news4vip",									// ← 2chの板の場合URLを省略できる
	"http://anago.2ch.net/software/",			// ← 省略しないでも書ける
	"hgame",									// ← PINKちゃんねるも同様
	"http://jbbs.livedoor.jp/computer/43680/",	// ← 2ch、bbspink以外の板の場合は板URLを指定する
	// 「 "板URL", 」の形式でこの行以降に追加
];
//￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣

var mes = "";
var BOARDBASE = false;
var BOARDVIEW = false;
if (v2c.context.args.length > 0) {
	var argLine = v2c.context.argLine;
	if (/\$BOARDBASE/i.test(argLine) && bdlist.length > 0) {
		BOARDBASE = true;
	}
	if (/\$BOARDVIEW/i.test(argLine)) {
		BOARDVIEW = true;
	}	
}
var global = [];
if (BOARDBASE  && ((bdlist != v2c.getProperty('bdlist')) || (!(global = v2c.getProperty('randomBoards'))))) {

	global = [];
	for (var i = 0; i < bdlist.length; i++) {
		var bd = v2c.bbs2ch.getBoard(bdlist[i]) || v2c.getBoard(bdlist[i]) || null;
		if (bd) { global.push(bd.url); }
	}
	if (global.length > 0) { 
		v2c.putProperty('randomBoards', global);
		v2c.putProperty('bdlist', bdlist);
	 }
}
function getRandom()
{
	if (!v2c.online) { return; }
	if (!BOARDBASE) {
		var th = v2c.resPane.selectedThread;
		if (!th) { mes = "[random.js] スレッドが開かれてないので板が取得できません。"; return; }
		global.push(th.board.url);
	}
	while(global.length > 0) {
		var idx = Math.floor(Math.random() * global.length);
		if (detectThread(v2c.getBoard(global[idx]))) { return; }
		global.splice(idx, 1);
	}
	mes = "[random.js] ランダムで開くための未取得スレッドがありませんでした。";
}
function detectThread(bd)
{
	if (!bd) { return false; }
	if (BOARDVIEW) { v2c.openURL(bd.url); }
	if (v2c.interrupted) { return false; }
	
	var bs = bd.url + 'subject.txt';
	var ss = v2c.readURL(bs);
	if (v2c.interrupted) { return false; }
	if (!ss) { mes = bs+'の取得に失敗'; return false; }
	
	var lines = ss.split('\n');
	var count = lines.length;
	while (count) {
		v2c.println(count);
		var idx = Math.floor(Math.random() * count);
		var key = '';
		var bbs = bd.bbs;
		if (bbs.is2ch || bbs.is2cheq) {
			key = /^(\d+)\.dat<>.+ \(\d+\)/.exec(lines[idx])[1];
		} else if (bbs.shitaraba || bbs.machi) {
			key = /^(\d+)\.cgi,.+\(\d+\)/.exec(lines[idx])[1];
		} else {
			return false; // twitter は除外
		}
		var th = bd.getThread(key);
		if (th && th.localResCount == 0) {
			th.open();
			return true;
		}
		lines.splice(idx, 1);
		count--;
	}
	return false;
}

getRandom();
if (mes != "") { v2c.context.setStatusBarText(mes); }
