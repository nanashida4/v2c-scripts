//【登録場所】お気に入り、ツールバー
//【ラベル】検索キーワード名＠板名 など
//【コマンド】${SCRIPT:SFRx} getBakusaiCatalog.js $ACODE(3) $SEARCH(BBS名)
//【アクション】スレ一覧で開く ←※忘れやすいんで設定し忘れに注意
//【更新日時】2014/06/12 爆サイの変更に対応
//            2014/04/11 ニュース系の板の取得に対応
//            2014/04/10 CTGID,BIDが使えない不具合の修正  
//            2013/12/15 爆サイのdatを取得時スレkeyの0埋めでエラーが出る不具合の修正 (001234567.dat → 101234567.dat) に変更になります
//例：${SCRIPT:SFRx} getBakusaiLists.js $ACODE(3) $SEARCH(初心者)
//　　↑爆サイ 初心者･練習板からスレッド一覧を取得する
//【内容】
// ０．※getBakusaiLists.jsとgetdat.jsが必要
// １. お気に入り一覧かツールバーのボタン登録領域に上記例のようなコマンドのボタンを作成する(登録領域の場所がわからない場合wikiのfindThreadsMod.jsの詳細を参照)
// ２. 板が作成されてなければ再起動し、再度スレ一覧を開いてスレを選択しスレが表示されれば成功
//【コマンドの書式】
// ${SCRIPT:SFRx} getBakusaiLists.js 引数１ 引数２ 引数３ ... (以下の引数を半角スペースを空けて連続して書く。)
// $ACODE(地域ID) = (必須) 表示したい地域コード(数値)を入力します。 (北海道=1 東北=2 関東=3 甲信越=4 東海=5 北陸=6 関西=7 山陽=8 四国=9 九州=10 沖縄=11 山陰=12)
// $CTGID(カテゴリーID) = 表示したいカテゴリIDを入力します(URLにctgid=1のように付いてる) ※SEARCH使用の場合使用しない
// $BID(掲示板ID) = 表示したいBBSIDを入力します(URLにbid=1のように付いてる ※SEARCH使用の場合使用しない
// $SEARCH(BBS名) = BBS名(文字列の一部のみでも可)でmenuから掲示板を特定します。(CTGID、BIDの特定のみ ACODEは必須)
//【スクリプト】
// [設定] ------------------------------------------------------------
//var dacode = 3; // 地域IDの初期値(コマンド作成時にACODEを省略したい場合文頭の「//」を削除
// [設定ここまで] ----------------------------------------------------
function getThreads(cx) {
	if (!v2c.online) { cx.skip = true; return null; }
	var thl = [];
	
	var acode = 0;
	var ctgid = 0;
	var bid   = 0;
	var title = '';
	
	if (v2c.context.args.length > 0) {
		var matches = [];
		var argLine = v2c.context.argLine;
		acode = (matches = /\$ACODE\(([^\)]+)\)/i.exec(argLine)) ? parseInt(matches[1]) : (typeof(dacode) === "undefined") ? 0 : dacode;
		if (matches =  /\$SEARCH\(([^\)]+)\)/i.exec(argLine)) {
			var kw = (matches = /\$SEARCH\(([^\)]+)\)/i.exec(argLine)) ? matches[1] : 0;
			var tmp = v2c.readURL('http://bakusai.com/areamenu/acode=' + acode + '/');
			if (!tmp) { printlnLog('板一覧が見つかりませんでした。'); throw '板一覧が見つかりませんでした。'; return null; }
			var reg = new RegExp('<a href="/thr_tl/acode=\\d+/ctgid=(\\d+)\/bid=(\\d+)/" title="(?:[^"]+)?">(.*?' + kw + '[^<]*)?</a>', 'i');
			if (matches = reg.exec(tmp)) {
				ctgid = matches[1];
				bid   = matches[2];
				title = matches[3];
			}
		}
		else {
			ctgid = (matches = /\$CTGID\(([^\)]+?)\)/i.exec(argLine)) ? parseInt(matches[1]) : 0;
			bid = (matches = /\$BID\(([^\)]+?)\)/i.exec(argLine)) ? parseInt(matches[1]) : 0;
			var tmp = v2c.readURL('http://bakusai.com/thr_tl/acode=' + acode + '/ctgid=' + ctgid + '/bid=' + bid + '/');
			if (!tmp) { printlnLog('板一覧が見つかりませんでした。'); throw '板一覧が見つかりませんでした。'; return null; }
			var reg = new RegExp('<strong>([^<]+)</strong>', 'i');
			if (matches = reg.exec(tmp)) {
				title = matches[1];
			}
		}
		// 板登録
		
		var vurl = 'http://bakusai.com/a' + acode + 'c' + ctgid + 'b' + bid + '/';
		var bd   = v2c.getBoard(vurl, title);
		if (!bd) {
			insertTreeCode(vurl, title);
		}
		thl = bakusaiLists('http://bakusai.com/thr_tl/acode=' + acode + '/ctgid=' + ctgid + '/bid=' + bid + '/', bd);
	}
	return thl;
}

function insertTreeCode(url, title)
{
	var f = new java.io.File(v2c.saveDir + '/BBS/UserDefined/bbstree.txt');
	var tmp = String(v2c.readStringFromFile(f));
	var treecode = '2,' + url + ',爆サイ (' + title + ')\r\n';
	
	if (tmp.indexOf(treecode) < 0) {
		if (tmp.indexOf('1,C,爆サイ') >= 0) {
			tmp = tmp.split('1,C,爆サイ\r\n').join('1,C,爆サイ\r\n' + treecode);
		} else {
			tmp += '1,C,爆サイ\r\n' + treecode;
		}
		v2c.writeStringToFile(f, tmp, "UTF-8");
		v2c.alert('『爆サイ (' + title + ')』板を作成しました。V2Cを再起動します。');
		v2c.restart();
	}
}

function bakusaiLists(url, bd)
{
	var thl = [];
	var page = 1;
	var reg = /<a href="\/thr_res\/acode=\d+\/ctgid=\d+\/bid=\d+\/tid=(\d+)\/tp=\d+\/">([^<]+)<\/a>&nbsp;\((\d+)\)/ig;
	while (1) {
		var html = v2c.readURL(url + '/p=' + page + '/');
		if (!html) { return null; }
		var matches = [];
		var s1 = html.indexOf(html.match(/<div id="thr_list\d?">/));
		if (s1 < 0) {
			reg = /<a href="\/thr_res\/acode=\d+\/ctgid=\d+\/bid=\d+\/tid=(\d+)\/tp=\d+\/" title="([^"]+)">[\s\S]*?<td>\d+\/\d+ \d+:\d+\((\d+)件\)/ig;
			s1 = html.indexOf('<div class="thr_list">');
		}
		if (s1 < 0) {
			printlnLog('スレ一覧を取得出来ませんでした。本スクリプトが対応出来ていない爆サイページのようです。(' + url + ')');
			return thl;
		}
		html = html.substring(s1, getEndTag(html, s1, "div"));
		if (html.indexOf('まだスレッドがありません。') >= 0 || html == '') 
			break;
		var add = 1000000000;
		while (matches = reg.exec(html)) {
			var k, t, n;
			k = parseInt(matches[1]);
			k = k + add;
			t = matches[2];
			if (t.length <= 0)
				t = 'タイトルなし';
			n = parseInt(matches[3]);
			var th = bd.getThread(k, null, t, n);
			if (th)
				thl.push(th);
		}
		page = page + 1;
	}
	return thl;
}

function getEndTag(html, startIdx, tagName)
{
	var sTag = '<' + tagName;
	var eTag = '</' + tagName + '>';
	html = String(html);
	var loopcount = 5000;
	var traverse = function(gen, idx)
	{
		var t1 = -1, t2 = -1;
		if (--loopcount < 0) {
			v2c.println('[getEndTag():Error] ループ回数の最大値を超えたので中断します。');
			return -1;
		}
		
		t1 = html.indexOf(sTag, idx);
		t2 = html.indexOf(eTag, idx);
		
		if (t1 < t2 && t1 != -1)
			idx = traverse(++gen, t1 + sTag.length);
		else if (t2 != -1) {
			if (--gen > 0)
				idx = traverse(gen, t2 + eTag.length);
			else
				idx = t2 + eTag.length;
		} else {
			v2c.println('[getEndTag():Error] エンドタグを辿れませんでした');
			return -1;
		}
		return idx;
	}
	return traverse(0, startIdx);
}

function statusLog(format /*, ...*/)
{
		var args = arguments;
		var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1] });
		v2c.context.setStatusBarText("[getBakusaiLists.js] " + message);
}
function printlnLog(format /*, ...*/)
{
		var args = arguments;
		var message = format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1] });
		v2c.println("[getBakusaiLists.js] " + message);
}