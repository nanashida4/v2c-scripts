//【登録場所】レス表示
//【ラベル】[latfilter.js] 取得済みの現スレからIDでレス抽出
//【コマンド】${SCRIPT:Frw} latfilterId.js ローカル板のフォルダ名
//【コマンド】${SCRIPT:Frw} latfilterId.js ローカル板のフォルダ名 $TODAYSPAN
//            ↑ 引数 $TODAYSPAN … 現スレに加えて、DAT落ちスレッドのレスの内同じ日付のレスも抽出対象に含める
//【ラベル２】[latfilter.js] 元レスにジャンプ
//【コマンド２】${SCRIPT:Frw} latfilterId.js ローカル板のフォルダ名 $GOTORES
//【内容】右クリした位置のレスのIDで、そのスレッドの所属板のDAT落ちを除く既得ログから
//        IDでレスを抽出して、ローカルスレッドを作成する。
//【更新日】 2012/01/27
//【スクリプト】
function log(format /*, ...*/)
{
	var args = arguments;
	var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1]; });
	v2c.println("[latfilter.js] " + message);
}
function statuslog(format /*, ...*/)
{
	var args = arguments;
	var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1]; });
	v2c.context.setStatusBarText('[latfilter.js] ' + message);
}
function getMSec(date) {
	var yy = date.getYear();
	var mm = date.getMonth();
	var dd = date.getDate();
	if (yy < 2000) { yy +=  1900; }
	return (new Date(yy, mm, dd)).getTime();
}
(function() {
if (v2c.context.args.length == 0) {
	statuslog("外部コマンドにローカル板のフォルダ名が指定されていません");
	return false;
}
var GOTORES = false;
var TODAYSPAN = false;
var local = null;
for (var i = 0; i < v2c.context.args.length; i++) {
	if (v2c.context.args[i].match(/\$GOTORES/i)) {
		GOTORES = true;
		continue;
	}
	if (v2c.context.args[i].match(/\$TODAYSPAN/i)) {
		TODAYSPAN = true;
		continue;
	}
	local = v2c.context.args[i];
}

local = v2c.getLocalBoard(local);
if (!local) { 
	v2c.context.setStatusBarText("ローカル板( " + v2c.context.args[0] + " )を取得できませんでした");
	return false;
}
if (GOTORES) {
	var th = v2c.context.thread;
	if ((!th) || (!th.local)) { 
		statuslog("latfilterId.jsで作成したローカルスレッド以外では元レスジャンプ機能が使用できません。");
		return false;
	}
	var ldat = v2c.readLinesFromFile(new java.io.File(v2c.saveDir + '/log/localboard/' + local.key + '/' + th.key + '.dat'));
	var resNum = v2c.context.res.number - 1;
	if ((!ldat) || ldat.length <= resNum) { statuslog("ローカルスレッドのDATが読み込めませんでした。"); return false; }
	if (String(ldat[resNum]).match(/<!--V2CANOT src="([^"]+)"-->/)) {
		var refURL = RegExp.$1.replace(/:/g, '/').split('/');
		refURL = 'http://' + refURL[0] + '/test/read.cgi/' + refURL[1] + '/' + refURL[2] + '/' + refURL[3];

		v2c.openURL(new java.net.URL(refURL));
		return true;
	}
	return false;
}

var tmp = v2c.context.res;
if (!tmp) { return; }
var today, tomorrow, spanKeys = {};
if (TODAYSPAN) {
	var tdtmp = v2c.context.res.time;
	if (tdtmp == 0) { 
		TODAYSPAN = false;
		log("レスから日時を取得出来ませんでした。TODAYSPANモードを解除して実行します");
	} else {
		today = new Date();
		today.setTime(tdtmp);
		today = getMSec(today);
		tomorrow = today + 86400000;
	}
	var threadst = v2c.readStringFromFile(new java.io.File(v2c.context.thread.localFile.getParent() + '/threadst.txt'));
	threadst = String(threadst).split('\n');
	var tp, sres, lres, key;
	for (var i = threadst.length - 1; i > 0; i--) {
		if (threadst[i].length == 0) { continue; }
		tp = threadst[i].split(',');

		key = tp[1].split('.')[0];
		sres = parseInt(key + '000');

		if (tomorrow < sres) { continue; } // 日付変更でIDが変わったあとのスレッドは対象外
		lres = tp[11];	// TLAST 最終レス時刻
		if (lres.length < 4) {
			lres = tp[6];	// TLASTGET 最終取得時刻
			if (lres.length < 4) { continue; }
		}
		lres = parseInt(lres);
		if (lres < today) { continue; } 	// 最終レスがレスの日以前のスレッドは対象外
		spanKeys[key] = true;
	}
}
var resId = tmp.id;
if ((!resId) || resId.length < 4) { v2c.context.setStatusBarText('[latfilterId.js] IDが取得できませんでした。(レスNo.' + tmp.number + ')'); return; }
var resDate = tmp.date.split(' ')[0];
var bdlog = v2c.context.thread.board.threadsWithLog;
var outresArray = [];

nextthread: 
for (var i = 0; i < bdlog.length; i++) {
	var atfirst = true;
	if (!bdlog[i].live) {

		if ((!TODAYSPAN) || (!spanKeys[bdlog[i].key])) { continue; }
		for (var j = bdlog[i].localResCount - 1; j >= 0; j--) {
			if (j >= 1000) { j = 999; }
			var tres = bdlog[i].getRes(j);
			if (tres.time < today) { 
				continue nextthread;
			}
			if (tres.time < tomorrow && tres.id == resId) {
				if (atfirst) {
					outresArray.push(v2c.createResSeparator(bdlog[i].title + ' ( ' + bdlog[i].url + ' )'));
					atfirst = false;
				}
				outresArray.push(tres);
			}
		}
		continue;
	}
	for (var j = 0; j < bdlog[i].localResCount; j++) {
		tmp = bdlog[i].getRes(j);
		if (tmp.id == resId) {
			if (atfirst) {
				outresArray.push(v2c.createResSeparator(bdlog[i].title + ' ( ' + bdlog[i].url + ' )'));
				atfirst = false;
			}
			outresArray.push(tmp);
		}
	}
}
if (outresArray.length == 0) {
	statuslog('IDに一致するレスが見つかりませんでした。現スレ以外では外部コマンドに$TODAYSPAN引数を指定して下さい。');
	return false;
}
var lth = local.createLocalThread("ID:"+resId+"でレス抽出＠"+v2c.context.thread.board.name, outresArray);
if (!lth) {
	statuslog("ローカルスレッドが作成できませんでした。");
	return false;
}
lth.open(false);
return true;
})();